// ── Entry point ──────────────────────────────────────────────────────────────

import { initTheme, toggleTheme } from './theme';
import { renderWatermark, loadImageFile } from './watermark';
import { processBatch } from './batch';
import type { RenderOptions, WatermarkPosition } from './types';

// ── Bootstrap ────────────────────────────────────────────────────────────────

initTheme();

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

// ── State ─────────────────────────────────────────────────────────────────────

let sourceImg: HTMLImageElement | null = null;
let wmImg: HTMLImageElement | null = null;
let batchFiles: File[] = [];
let activeTab: 'text' | 'image' = 'text';
let activeMode: 'single' | 'batch' = 'single';

// ── Element refs ──────────────────────────────────────────────────────────────

const canvas       = document.getElementById('canvas') as HTMLCanvasElement;
const emptyState   = document.getElementById('empty-state') as HTMLElement;
const dropZone     = document.getElementById('drop-zone') as HTMLElement;
const fileInput    = document.getElementById('file-input') as HTMLInputElement;
const batchInput   = document.getElementById('batch-input') as HTMLInputElement;
const wmImgDrop    = document.getElementById('wm-img-drop') as HTMLElement;
const wmImgInput   = document.getElementById('wm-img-input') as HTMLInputElement;
const wmImgPreview = document.getElementById('wm-img-preview') as HTMLImageElement;
const batchList    = document.getElementById('batch-list') as HTMLElement;
const progressBar  = document.getElementById('progress-bar') as HTMLElement;
const progressWrap = document.getElementById('progress-wrap') as HTMLElement;
const btnApply     = document.getElementById('btn-apply') as HTMLButtonElement;
const btnDownload  = document.getElementById('btn-download') as HTMLButtonElement;
const btnBatch     = document.getElementById('btn-batch') as HTMLButtonElement;
const btnReset     = document.getElementById('btn-reset') as HTMLButtonElement;

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

function getRenderOpts(): RenderOptions {
  const position = val('wm-position') as WatermarkPosition;
  const opacity  = num('wm-opacity');
  const rotation = num('wm-rotate');
  const margin   = num('wm-margin');

  if (activeTab === 'image') {
    return {
      watermark: {
        type: 'image',
        image: wmImg ?? new Image(),
        scale: num('wm-img-scale'),
      },
      position, opacity, rotation, margin,
    };
  }

  return {
    watermark: {
      type: 'text',
      text:  val('wm-text'),
      font:  val('wm-font'),
      size:  num('wm-size'),
      style: val('wm-style'),
      color: val('wm-color-hex') || '#ffffff',
    },
    position, opacity, rotation, margin,
  };
}

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

function loadSource(file: File): void {
  loadImageFile(file).then((img) => {
    sourceImg = img;
    emptyState.style.display = 'none';
    canvas.style.display = 'block';
    btnApply.disabled = false;
    renderWatermark(canvas, img, getRenderOpts());
    toast('Image loaded ✓');
  }).catch(() => toast('Failed to load image'));
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
    row.innerHTML = `
      <span class="batch-name">${file.name}</span>
      <span class="batch-status pending" id="bs-${i}">Waiting</span>
    `;
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
  loadImageFile(file).then((img) => {
    wmImg = img;
    wmImgPreview.src = img.src;
    wmImgPreview.style.display = 'block';
    toast('Watermark image loaded ✓');
    if (sourceImg) applyWatermark();
  }).catch(() => toast('Failed to load watermark image'));
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

document.querySelectorAll<HTMLElement>('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeMode = btn.dataset['mode'] as 'single' | 'batch';
    document.getElementById('single-panel')?.classList.toggle('active', activeMode === 'single');
    document.getElementById('batch-panel')?.classList.toggle('active', activeMode === 'batch');
  });
});

// ── Range labels ─────────────────────────────────────────────────────────────

function syncRange(id: string, displayId: string, suffix: string): void {
  const el = document.getElementById(id) as HTMLInputElement;
  const out = document.getElementById(displayId) as HTMLElement;
  el.addEventListener('input', () => { out.textContent = el.value + suffix; });
}

syncRange('wm-opacity',   'wm-opacity-val',   '%');
syncRange('wm-rotate',    'wm-rotate-val',    '°');
syncRange('wm-img-scale', 'wm-img-scale-val', '%');

// ── Color sync ────────────────────────────────────────────────────────────────

const colorPicker = document.getElementById('wm-color') as HTMLInputElement;
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
  'wm-opacity', 'wm-rotate', 'wm-position', 'wm-margin', 'wm-img-scale',
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
  toast('Watermark applied ✓');
}

btnDownload.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'watermarked.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  toast('Download started ✓');
});

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

// ── Batch processing ──────────────────────────────────────────────────────────

btnBatch.addEventListener('click', async () => {
  if (!batchFiles.length) return;
  if (activeTab === 'image' && !wmImg) {
    toast('Please load a watermark image first');
    return;
  }

  btnBatch.disabled = true;
  progressWrap.style.display = 'block';
  progressBar.style.width = '0%';

  await processBatch(batchFiles, getRenderOpts(), {
    onFileStart: (i) => {
      const el = document.getElementById(`bs-${i}`);
      if (el) { el.textContent = 'Processing…'; el.className = 'batch-status processing'; }
    },
    onFileComplete: (i) => {
      const el = document.getElementById(`bs-${i}`);
      if (el) { el.textContent = 'Done ✓'; el.className = 'batch-status done'; }
    },
    onFileError: (i) => {
      const el = document.getElementById(`bs-${i}`);
      if (el) { el.textContent = 'Error ✗'; el.className = 'batch-status error'; }
    },
    onProgress: (pct) => {
      progressBar.style.width = `${pct}%`;
    },
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
const btnInstall    = document.getElementById('btn-install') as HTMLButtonElement;
const btnDismiss    = document.getElementById('btn-dismiss') as HTMLButtonElement;

// Capture the browser's install prompt event
window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredInstallPrompt = e as BeforeInstallPromptEvent;

  // Only show the banner if user hasn't permanently dismissed it
  if (sessionStorage.getItem('pwa-dismissed') !== '1') {
    // Small delay so it doesn't pop up before the user has seen the app
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

// Hide banner once the app is successfully installed
window.addEventListener('appinstalled', () => {
  installBanner.classList.remove('visible');
  deferredInstallPrompt = null;
  toast('App installed! You can now launch it from your home screen ✓', 4000);
});
