import { createContext, useContext, useReducer, useCallback, type ReactNode, type Dispatch } from 'react';
import type { WatermarkPosition, RenderOptions } from '../lib/types';

// ── State ───────────────────────────────────────────────────────────────────

export interface WatermarkState {
  // Source
  sourceImg: HTMLImageElement | null;
  sourceFile: File | null;

  // Watermark type
  activeTab: 'text' | 'image';

  // Text settings
  text: string;
  font: string;
  size: number;
  style: string;
  color: string;

  // Image settings
  wmImg: HTMLImageElement | null;
  wmImgScale: number;

  // Position & style
  position: WatermarkPosition;
  opacity: number;
  rotation: number;
  margin: number;

  // Free placement
  freeX: number;
  freeY: number;

  // Mode
  mode: 'single' | 'batch';

  // Batch
  batchFiles: File[];
  batchStatuses: Array<'pending' | 'processing' | 'done' | 'error'>;
  batchProgress: number;
  isProcessing: boolean;

  // Download state
  hasApplied: boolean;
}

const initialState: WatermarkState = {
  sourceImg: null,
  sourceFile: null,
  activeTab: 'text',
  text: '© My Watermark',
  font: 'Arial',
  size: 48,
  style: '',
  color: '#ffffff',
  wmImg: null,
  wmImgScale: 25,
  position: 'free',
  opacity: 60,
  rotation: -30,
  margin: 20,
  freeX: 0.5,
  freeY: 0.5,
  mode: 'single',
  batchFiles: [],
  batchStatuses: [],
  batchProgress: 0,
  isProcessing: false,
  hasApplied: false,
};

// ── Actions ──────────────────────────────────────────────────────────────────

export type WatermarkAction =
  | { type: 'SET_SOURCE'; img: HTMLImageElement; file: File }
  | { type: 'SET_ACTIVE_TAB'; tab: 'text' | 'image' }
  | { type: 'SET_TEXT'; value: string }
  | { type: 'SET_FONT'; value: string }
  | { type: 'SET_SIZE'; value: number }
  | { type: 'SET_STYLE'; value: string }
  | { type: 'SET_COLOR'; value: string }
  | { type: 'SET_WM_IMG'; img: HTMLImageElement }
  | { type: 'SET_WM_IMG_SCALE'; value: number }
  | { type: 'SET_POSITION'; value: WatermarkPosition }
  | { type: 'SET_OPACITY'; value: number }
  | { type: 'SET_ROTATION'; value: number }
  | { type: 'SET_MARGIN'; value: number }
  | { type: 'SET_FREE_POS'; x: number; y: number }
  | { type: 'SET_MODE'; value: 'single' | 'batch' }
  | { type: 'SET_BATCH_FILES'; files: File[] }
  | { type: 'SET_BATCH_STATUS'; index: number; status: 'pending' | 'processing' | 'done' | 'error' }
  | { type: 'SET_BATCH_PROGRESS'; value: number }
  | { type: 'SET_IS_PROCESSING'; value: boolean }
  | { type: 'SET_HAS_APPLIED'; value: boolean }
  | { type: 'RESET' };

function reducer(state: WatermarkState, action: WatermarkAction): WatermarkState {
  switch (action.type) {
    case 'SET_SOURCE':
      return { ...state, sourceImg: action.img, sourceFile: action.file, freeX: 0.5, freeY: 0.5, hasApplied: false };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_TEXT':
      return { ...state, text: action.value };
    case 'SET_FONT':
      return { ...state, font: action.value };
    case 'SET_SIZE':
      return { ...state, size: action.value };
    case 'SET_STYLE':
      return { ...state, style: action.value };
    case 'SET_COLOR':
      return { ...state, color: action.value };
    case 'SET_WM_IMG':
      return { ...state, wmImg: action.img };
    case 'SET_WM_IMG_SCALE':
      return { ...state, wmImgScale: action.value };
    case 'SET_POSITION':
      return { ...state, position: action.value };
    case 'SET_OPACITY':
      return { ...state, opacity: action.value };
    case 'SET_ROTATION':
      return { ...state, rotation: action.value };
    case 'SET_MARGIN':
      return { ...state, margin: action.value };
    case 'SET_FREE_POS':
      return { ...state, freeX: action.x, freeY: action.y };
    case 'SET_MODE':
      return { ...state, mode: action.value };
    case 'SET_BATCH_FILES':
      return {
        ...state,
        batchFiles: action.files,
        batchStatuses: action.files.map(() => 'pending' as const),
        batchProgress: 0,
      };
    case 'SET_BATCH_STATUS': {
      const statuses = [...state.batchStatuses];
      statuses[action.index] = action.status;
      return { ...state, batchStatuses: statuses };
    }
    case 'SET_BATCH_PROGRESS':
      return { ...state, batchProgress: action.value };
    case 'SET_IS_PROCESSING':
      return { ...state, isProcessing: action.value };
    case 'SET_HAS_APPLIED':
      return { ...state, hasApplied: action.value };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface WatermarkContextValue {
  state: WatermarkState;
  dispatch: Dispatch<WatermarkAction>;
  getRenderOpts: () => RenderOptions;
}

const WatermarkContext = createContext<WatermarkContextValue | null>(null);

export function WatermarkProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getRenderOpts = useCallback((): RenderOptions => {
    const base = {
      position: state.position,
      opacity: state.opacity,
      rotation: state.rotation,
      margin: state.margin,
      freeX: state.freeX,
      freeY: state.freeY,
    };

    if (state.activeTab === 'image') {
      return {
        ...base,
        watermark: {
          type: 'image',
          image: state.wmImg ?? new Image(),
          scale: state.wmImgScale,
        },
      };
    }

    return {
      ...base,
      watermark: {
        type: 'text',
        text: state.text,
        font: state.font,
        size: state.size,
        style: state.style,
        color: state.color,
      },
    };
  }, [state]);

  return (
    <WatermarkContext.Provider value={{ state, dispatch, getRenderOpts }}>
      {children}
    </WatermarkContext.Provider>
  );
}

export function useWatermark(): WatermarkContextValue {
  const ctx = useContext(WatermarkContext);
  if (!ctx) throw new Error('useWatermark must be used within WatermarkProvider');
  return ctx;
}
