import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ── window.matchMedia mock ────────────────────────────────────────────────────
// jsdom does not implement matchMedia; provide a minimal stub.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── HTMLCanvasElement.getContext mock ─────────────────────────────────────────
// jsdom does not implement canvas 2D context; mock it with jest/vi spies so
// renderWatermark tests can verify calls without a real canvas.
const mockCtx: Partial<CanvasRenderingContext2D> & Record<string, unknown> = {
  drawImage: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 100 }),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  set globalAlpha(v: number) {
    this._globalAlpha = v;
  },
  get globalAlpha() {
    return (this._globalAlpha as number) ?? 1;
  },
  set fillStyle(_v: string | CanvasGradient | CanvasPattern) {},
  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return '';
  },
  set font(_v: string) {},
  get font(): string {
    return '';
  },
  set textBaseline(_v: CanvasTextBaseline) {},
  get textBaseline(): CanvasTextBaseline {
    return 'alphabetic';
  },
};

HTMLCanvasElement.prototype.getContext = vi
  .fn()
  .mockReturnValue(mockCtx) as typeof HTMLCanvasElement.prototype.getContext;
