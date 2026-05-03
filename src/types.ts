// ── Shared types ────────────────────────────────────────────────────────────

export type WatermarkType = 'text' | 'image';

export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'tile';

export interface TextWatermarkOptions {
  type: 'text';
  text: string;
  font: string;
  size: number;
  style: string;
  color: string;
}

export interface ImageWatermarkOptions {
  type: 'image';
  image: HTMLImageElement;
  scale: number;
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

export interface RenderOptions {
  watermark: WatermarkOptions;
  position: WatermarkPosition;
  opacity: number;
  rotation: number;
  margin: number;
}
