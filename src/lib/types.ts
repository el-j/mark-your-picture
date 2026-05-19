// ── Shared types ────────────────────────────────────────────────────────────

export type WatermarkType = 'text' | 'image';

export type WatermarkPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'tile'
  | 'free';

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
  /** Used only when position === 'free'. Values are fractions of canvas size (0–1). */
  freeX?: number;
  freeY?: number;
}

export interface PersistedWatermarkState {
  activeTab: 'text' | 'image';
  text: string;
  font: string;
  size: number;
  style: string;
  color: string;
  wmImageDataUrl?: string | null;
  wmImgScale: number;
  position: WatermarkPosition;
  opacity: number;
  rotation: number;
  margin: number;
  freeX: number;
  freeY: number;
  mode: 'single' | 'batch';
  projectName: string;
  currentProjectId: string | null;
  currentProjectCreatedAt: string | null;
}

export interface SavedProjectSnapshot {
  id: string;
  name: string;
  state: PersistedWatermarkState;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExportFile {
  version: 1;
  project: SavedProjectSnapshot;
}

export interface StorageStats {
  count: number;
  newestUpdatedAt: string | null;
}
