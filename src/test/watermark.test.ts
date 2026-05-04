import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RenderOptions } from '../lib/types';
import { loadImageFile, renderWatermark } from '../lib/watermark';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCanvas(): HTMLCanvasElement {
  return document.createElement('canvas');
}

function makeImage(w = 800, h = 600): HTMLImageElement {
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: w, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: h, configurable: true });
  return img;
}

function makeTextOpts(partial: Partial<RenderOptions> = {}): RenderOptions {
  return {
    watermark: {
      type: 'text',
      text: 'Test',
      font: 'Arial',
      size: 48,
      style: '',
      color: '#ffffff',
    },
    position: 'bottom-right',
    opacity: 80,
    rotation: 0,
    margin: 20,
    ...partial,
  };
}

// Helper: get the mocked ctx from a canvas
function getCtx(canvas: HTMLCanvasElement) {
  return canvas.getContext('2d') as unknown as Record<string, ReturnType<typeof vi.fn>>;
}

// ── renderWatermark ───────────────────────────────────────────────────────────

describe('renderWatermark', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = makeCanvas();
    vi.clearAllMocks();
  });

  it('sets canvas dimensions from the source image', () => {
    const img = makeImage(1024, 768);
    renderWatermark(canvas, img, makeTextOpts());
    expect(canvas.width).toBe(1024);
    expect(canvas.height).toBe(768);
  });

  it('returns early without throwing when text is empty', () => {
    const img = makeImage();
    const opts = makeTextOpts({
      watermark: { type: 'text', text: '', font: 'Arial', size: 48, style: '', color: '#fff' },
    });
    expect(() => renderWatermark(canvas, img, opts)).not.toThrow();
  });

  it('calls fillText for text watermark at bottom-right', () => {
    const img = makeImage();
    renderWatermark(canvas, img, makeTextOpts({ position: 'bottom-right' }));
    expect(getCtx(canvas).fillText).toHaveBeenCalled();
  });

  it('calls fillText for text watermark at top-left', () => {
    const img = makeImage();
    renderWatermark(canvas, img, makeTextOpts({ position: 'top-left' }));
    expect(getCtx(canvas).fillText).toHaveBeenCalled();
  });

  it('calls fillText for text watermark at center', () => {
    const img = makeImage();
    renderWatermark(canvas, img, makeTextOpts({ position: 'center' }));
    expect(getCtx(canvas).fillText).toHaveBeenCalled();
  });

  it('calls fillText multiple times for tile position', () => {
    const img = makeImage(400, 300);
    renderWatermark(canvas, img, makeTextOpts({ position: 'tile' }));
    expect(getCtx(canvas).fillText.mock.calls.length).toBeGreaterThan(1);
  });

  it('calls fillText for free position', () => {
    const img = makeImage();
    renderWatermark(canvas, img, makeTextOpts({ position: 'free', freeX: 0.3, freeY: 0.7 }));
    expect(getCtx(canvas).fillText).toHaveBeenCalled();
  });

  it('uses freeX/freeY defaults (0.5) when not provided', () => {
    const img = makeImage();
    renderWatermark(canvas, img, makeTextOpts({ position: 'free' }));
    expect(getCtx(canvas).fillText).toHaveBeenCalled();
  });

  it('draws image watermark at a corner position', () => {
    const img = makeImage();
    const wmImg = makeImage(100, 50);
    const opts: RenderOptions = {
      watermark: { type: 'image', image: wmImg, scale: 100 },
      position: 'top-right',
      opacity: 80,
      rotation: 0,
      margin: 10,
    };
    renderWatermark(canvas, img, opts);
    // drawImage called at least twice: source + watermark
    expect(getCtx(canvas).drawImage.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('tiles image watermark when position is tile', () => {
    const img = makeImage(400, 300);
    const wmImg = makeImage(50, 50);
    const opts: RenderOptions = {
      watermark: { type: 'image', image: wmImg, scale: 100 },
      position: 'tile',
      opacity: 80,
      rotation: 0,
      margin: 0,
    };
    renderWatermark(canvas, img, opts);
    expect(getCtx(canvas).drawImage.mock.calls.length).toBeGreaterThan(2);
  });

  it('calls rotate when rotation is non-zero', () => {
    const img = makeImage();
    renderWatermark(canvas, img, makeTextOpts({ rotation: 45 }));
    expect(getCtx(canvas).rotate).toHaveBeenCalled();
  });
});

// ── loadImageFile ─────────────────────────────────────────────────────────────

describe('loadImageFile', () => {
  it('returns a Promise', () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' });
    const result = loadImageFile(file);
    expect(result).toBeInstanceOf(Promise);
  });

  it('rejects when the FileReader emits an error', async () => {
    const originalFileReader = globalThis.FileReader;
    class ErrorFileReader {
      onload: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => this.onerror?.(new Error('read error')), 0);
      }
    }
    globalThis.FileReader = ErrorFileReader as unknown as typeof FileReader;

    const file = new File(['bad'], 'bad.txt', { type: 'text/plain' });
    await expect(loadImageFile(file)).rejects.toBeDefined();

    globalThis.FileReader = originalFileReader;
  });
});
