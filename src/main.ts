// ── Entry point ──────────────────────────────────────────────────────────────

import { initTheme, toggleTheme } from './theme';
import { renderWatermark, loadImageFile } from './watermark';
import { processBatch } from './batch';
import type { RenderOptions, WatermarkPosition } from './types';
import { initRouter } from './router';

// ── Bootstrap ────────────────────────────────────────────────────────────────

initTheme();
initRouter();

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

const hamburgerBtn = document.querySelector('.hamburger-btn');
const mobileNav = document.querySelector('.main-nav-mobile');
const overlay = document.querySelector('.menu-overlay');
const navLinks = document.querySelectorAll('.nav-link');

const toggleMenu = () => {
  const isMenuOpen = mobileNav?.classList.contains('is-open');
  if (isMenuOpen) {
    mobileNav?.classList.remove('is-open');
    hamburgerBtn?.classList.remove('is-active');
    overlay?.classList.remove('is-visible');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  } else {
    mobileNav?.classList.add('is-open');
    hamburgerBtn?.classList.add('is-active');
    overlay?.classList.add('is-visible');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
};

hamburgerBtn?.addEventListener('click', toggleMenu);
overlay?.addEventListener('click', toggleMenu);
navLinks.forEach((link) => {
  link.addEventListener('click', function () {
    navLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    if (mobileNav?.classList.contains('is-open')) toggleMenu();
  });
});

// ── State ─────────────────────────────────────────────────────────────────────

let sourceImg: HTMLImageElement | null = null;
let sourceFile: File | null = null;
let wmImg: HTMLImageElement | null = null;
let batchFiles: File[] = [];
let activeTab: 'text' | 'image' = 'text';
let activeMode: 'single' | 'batch' = 'single';

/** Free-placement position as fractions of image dimensions (0–1). */
let freeX = 0.5;
let freeY = 0.5;
let isDragging = false;

// ── Element refs ──────────────────────────────────────────────────────────────

const canvas        = document.getElementById('canvas') as HTMLCanvasElement;
const dropZone      = document.getElementById('drop-zone') as HTMLElement;
const fileInput     = document.getElementById('file-input') as HTMLInputElement;
const batchInput    = document.getElementById('batch-input') as HTMLInputElement;
const wmImgDrop     = document.getElementById('wm-img-drop') as HTMLElement;
const wmImgInput    = document.getElementById('wm-img-input') as HTMLInputElement;
const wmImgPreview  = document.getElementById('wm-img-preview') as HTMLImageElement;
const batchList     = document.getElementById('batch-list') as HTMLElement;
const progressBar   = document.getElementById('progress-bar') as HTMLElement;
const progressWrap  = document.getElementById('progress-wrap') as HTMLElement;
const btnApply      = document.getElementById('btn-apply') as HTMLButtonElement;
const btnDownload   = document.getElementById('btn-download') as HTMLButtonElement;
const btnBatch      = document.getElementById('btn-batch') as HTMLButtonElement;
const btnReset      = document.getElementById('btn-reset') as HTMLButtonElement;
const positionSel   = document.getElementById('wm-position') as HTMLSelectElement;
const marginRow     = document.getElementById('margin-row') as HTMLElement;
const freeHint      = document.getElementById('free-hint') as HTMLElement | null;
const downloadLabel = document.getElementById('download-label') as HTMLElement | null;

// ── Toast ─────────────────────────────────────────────────────────────────────

function toast(msg: string, duration = 2500): void {
  const el = document.getElementById('toast') as HTMLElement;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function val(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value;
}
function num(id: string): number {
  return Number(val(id));
}

/** Return the best canvas-output MIME type for the given source type. */
function resolveOutputMime(sourceMime?: string): string {
  const supported = ['image/jpeg', 'image/png', 'image/webp'];
  if (sourceMime && supported.includes(sourceMime)) return sourceMime;
  return 'image/png';
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
  };
  return map[mime] ?? 'png';
}

function outputFilename(originalName: string, ext: string): string {
  const base = originalName.replace(/\.[^/.]+$/, '');
  return `${base}_watermarked.${ext}`;
}

function updateDownloadLabel(): void {
  const mime = resolveOutputMime(sourceFile?.type);
  const ext  = mimeToExt(mime).toUpperCase();
  if (downloadLabel) downloadLabel.textContent = `Download ${ext}`;
}

function getRenderOpts(): RenderOptions {
  const position = val('wm-position') as WatermarkPosition;
  const opacity  = num('wm-opacity');
  const rotation = num('wm-rotate');
  const margin   = num('wm-margin');

  const base = { position, opacity, rotation, margin, freeX, freeY };

  if (activeTab === 'image') {
    return { ...base, watermark: { type: 'image', image: wmImg ?? new Image(), scale: num('wm-img-scale') } };
  }

  return {
    ...base,
    watermark: {
      type:  'text',
      text:  val('wm-text'),
      font:  val('wm-font'),
      size:  num('wm-size'),
      style: val('wm-style'),
      color: val('wm-color-hex') || '#ffffff',
    },
  };
}

// ── Position selector side-effects ────────────────────────────────────────────

function onPositionChange(): void {
  const isFree = positionSel.value === 'free';
  if (marginRow)  marginRow.style.display = isFree ? 'none' : '';
  if (freeHint)   freeHint.style.display  = isFree ? 'flex' : 'none';
  canvas.classList.toggle('free-mode', isFree);
  if (sourceImg)  applyWatermark();
}

positionSel.addEventListener('change', onPositionChange);

// ── Image upload (single) ────────────────────────────────────────────────────

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) loadSource(file);
});

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('over');
  const file = e.dataTransfer?.files[0];
  if (file?.type.startsWith('image/')) loadSource(file);
});

// Allow dropping a new image onto the canvas area too
canvas.addEventListener('dragover', (e) => { e.preventDefault(); });
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  if (file?.type.startsWith('image/')) loadSource(file);
});

function loadSource(file: File): void {
  loadImageFile(file)
    .then((img) => {
      sourceImg  = img;
      sourceFile = file;
      // Reset free position to center when new image loads
      freeX = 0.5;
      freeY = 0.5;

      dropZone.style.display    = 'none';
      canvas.style.display      = 'block';
      btnApply.disabled         = false;
      updateDownloadLabel();
      renderWatermark(canvas, img, getRenderOpts());
      toast('Image loaded ✓');
    })
    .catch(() => toast('Failed to load image'));
}

// ── Image upload (batch) ─────────────────────────────────────────────────────

const batchDrop = document.getElementById('batch-drop') as HTMLElement;

batchDrop.addEventListener('click', () => batchInput.click());
batchInput.addEventListener('change', (e) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? []);
  if (files.length) loadBatchFiles(files);
});
batchDrop.addEventListener('dragover', (e) => { e.preventDefault(); batchDrop.classList.add('over'); });
batchDrop.addEventListener('dragleave', () => batchDrop.classList.remove('over'));
batchDrop.addEventListener('drop', (e) => {
  e.preventDefault();
  batchDrop.classList.remove('over');
  const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
  if (files.length) loadBatchFiles(files);
});

function loadBatchFiles(files: File[]): void {
  batchFiles = files;
  batchList.innerHTML = '';
  files.forEach((file, i) => {
    const row = document.createElement('div');
    row.className = 'batch-item';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'batch-name';
    nameSpan.textContent = file.name;

    const statusSpan = document.createElement('span');
    statusSpan.className = 'batch-status pending';
    statusSpan.id = `bs-${i}`;
    statusSpan.textContent = 'Waiting';

    row.appendChild(nameSpan);
    row.appendChild(statusSpan);
    batchList.appendChild(row);
  });
  btnBatch.disabled = false;
  toast(`${files.length} image${files.length > 1 ? 's' : ''} ready`);
}

// ── Watermark image upload ────────────────────────────────────────────────────

wmImgDrop.addEventListener('click', () => wmImgInput.click());
wmImgInput.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) loadWmImage(file);
});

function loadWmImage(file: File): void {
  loadImageFile(file)
    .then((img) => {
      wmImg = img;
      wmImgPreview.src          = img.src;
      wmImgPreview.style.display = 'block';
      toast('Watermark image loaded ✓');
      if (sourceImg) applyWatermark();
    })
    .catch(() => toast('Failed to load watermark image'));
}

// ── Tabs (text / image watermark) ────────────────────────────────────────────

document.querySelectorAll<HTMLElement>('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset['tab'] as 'text' | 'image';
    document.getElementById(`panel-${activeTab}`)?.classList.add('active');
    if (sourceImg) applyWatermark();
  });
});

// ── Mode tabs (single / batch) ───────────────────────────────────────────────

document.querySelectorAll<HTMLElement>('.seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeMode = btn.dataset['mode'] as 'single' | 'batch';
    document.getElementById('single-panel')?.classList.toggle('active', activeMode === 'single');
    document.getElementById('batch-panel')?.classList.toggle('active', activeMode === 'batch');
  });
});

// ── Range labels ─────────────────────────────────────────────────────────────

function syncRange(id: string, displayId: string, suffix: string): void {
  const el  = document.getElementById(id) as HTMLInputElement;
  const out = document.getElementById(displayId) as HTMLElement;
  el.addEventListener('input', () => { out.textContent = el.value + suffix; });
}

syncRange('wm-opacity',   'wm-opacity-val',   '%');
syncRange('wm-rotate',    'wm-rotate-val',    '°');
syncRange('wm-img-scale', 'wm-img-scale-val', '%');

// ── Color sync ────────────────────────────────────────────────────────────────

const colorPicker = document.getElementById('wm-color')     as HTMLInputElement;
const colorHex    = document.getElementById('wm-color-hex') as HTMLInputElement;

colorPicker.addEventListener('input', () => {
  colorHex.value = colorPicker.value;
  if (sourceImg) applyWatermark();
});
colorHex.addEventListener('input', () => {
  if (/^#[0-9a-fA-F]{6}$/.test(colorHex.value)) {
    colorPicker.value = colorHex.value;
    if (sourceImg) applyWatermark();
  }
});

// ── Live preview ──────────────────────────────────────────────────────────────

const liveInputIds = [
  'wm-text', 'wm-font', 'wm-size', 'wm-style',
  'wm-opacity', 'wm-rotate', 'wm-margin', 'wm-img-scale',
];

liveInputIds.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const event = (el as HTMLInputElement).type === 'range' ? 'input' : 'change';
  el.addEventListener(event, () => { if (sourceImg) applyWatermark(); });
});

// ── Apply / Download / Reset ──────────────────────────────────────────────────

btnApply.addEventListener('click', applyWatermark);

function applyWatermark(): void {
  if (!sourceImg) return;
  renderWatermark(canvas, sourceImg, getRenderOpts());
  btnDownload.disabled = false;
}

// ── Download / Share ──────────────────────────────────────────────────────────

async function downloadOrShare(): Promise<void> {
  if (!sourceImg) return;

  const mime     = resolveOutputMime(sourceFile?.type);
  const ext      = mimeToExt(mime);
  const filename = outputFilename(sourceFile?.name ?? 'watermarked', ext);
  const quality  = mime === 'image/jpeg' ? 0.92 : undefined;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      mime,
      quality,
    );
  });

  const file = new File([blob], filename, { type: mime });

  // Try Web Share API (available on mobile and some desktop browsers)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Watermarked Image' });
      toast('Shared ✓');
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // user cancelled
      // share failed – fall through to download
    }
  }

  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast('Download started ✓');
}

btnDownload.addEventListener('click', () => downloadOrShare());

btnReset.addEventListener('click', () => {
  if (!sourceImg) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width  = sourceImg.naturalWidth;
  canvas.height = sourceImg.naturalHeight;
  ctx.drawImage(sourceImg, 0, 0);
  btnDownload.disabled = true;
  toast('Reset to original ✓');
});

// ── Free-placement drag on canvas ─────────────────────────────────────────────

function canvasCoords(e: MouseEvent | Touch): [number, number] {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  return [
    ((e.clientX - rect.left) * scaleX) / canvas.width,
    ((e.clientY - rect.top)  * scaleY) / canvas.height,
  ];
}

canvas.addEventListener('mousedown', (e) => {
  if (positionSel.value !== 'free') return;
  isDragging = true;
  [freeX, freeY] = canvasCoords(e);
  applyWatermark();
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || positionSel.value !== 'free') return;
  [freeX, freeY] = canvasCoords(e);
  applyWatermark();
});
canvas.addEventListener('mouseup',   () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });

canvas.addEventListener('touchstart', (e) => {
  if (positionSel.value !== 'free') return;
  e.preventDefault();
  isDragging = true;
  [freeX, freeY] = canvasCoords(e.touches[0]);
  applyWatermark();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  if (!isDragging || positionSel.value !== 'free') return;
  e.preventDefault();
  [freeX, freeY] = canvasCoords(e.touches[0]);
  applyWatermark();
}, { passive: false });
canvas.addEventListener('touchend', () => { isDragging = false; });

// ── Batch processing ──────────────────────────────────────────────────────────

btnBatch.addEventListener('click', async () => {
  if (!batchFiles.length) return;
  if (activeTab === 'image' && !wmImg) {
    toast('Please load a watermark image first');
    return;
  }

  btnBatch.disabled         = true;
  progressWrap.style.display = 'block';
  progressBar.style.width   = '0%';

  await processBatch(batchFiles, getRenderOpts(), {
    onFileStart:    (i)   => { const el = document.getElementById(`bs-${i}`); if (el) { el.textContent = 'Processing…'; el.className = 'batch-status processing'; } },
    onFileComplete: (i)   => { const el = document.getElementById(`bs-${i}`); if (el) { el.textContent = 'Done ✓';       el.className = 'batch-status done';       } },
    onFileError:    (i)   => { const el = document.getElementById(`bs-${i}`); if (el) { el.textContent = 'Error ✗';      el.className = 'batch-status error';       } },
    onProgress:     (pct) => { progressBar.style.width = `${pct}%`; },
    onDone: () => {
      btnBatch.disabled = false;
      toast('ZIP downloaded ✓', 3500);
      setTimeout(() => { progressWrap.style.display = 'none'; }, 3000);
    },
  });
});

// ── PWA install prompt ────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

const installBanner = document.getElementById('install-banner') as HTMLElement;
const btnInstall    = document.getElementById('btn-install')    as HTMLButtonElement;
const btnDismiss    = document.getElementById('btn-dismiss')    as HTMLButtonElement;

window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredInstallPrompt = e as BeforeInstallPromptEvent;
  if (sessionStorage.getItem('pwa-dismissed') !== '1') {
    setTimeout(() => installBanner.classList.add('visible'), 3000);
  }
});

btnInstall.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  installBanner.classList.remove('visible');
  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') toast('App installed ✓', 3000);
  deferredInstallPrompt = null;
});

btnDismiss.addEventListener('click', () => {
  installBanner.classList.remove('visible');
  sessionStorage.setItem('pwa-dismissed', '1');
});

window.addEventListener('appinstalled', () => {
  installBanner.classList.remove('visible');
  deferredInstallPrompt = null;
  toast('App installed! Launch it from your home screen ✓', 4000);
});

