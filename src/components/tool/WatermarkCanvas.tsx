import { useCallback, useEffect, useRef } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { loadImageFile, renderWatermark } from '../../lib/watermark';

export function WatermarkCanvas() {
  const { state, dispatch, getRenderOpts } = useWatermark();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  // Re-render watermark whenever any setting changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: all individual state fields are explicitly listed; getRenderOpts is derived from them
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !state.sourceImg) return;
    renderWatermark(canvas, state.sourceImg, getRenderOpts());
  }, [
    state.sourceImg,
    state.activeTab,
    state.text,
    state.font,
    state.size,
    state.style,
    state.color,
    state.wmImg,
    state.wmImgScale,
    state.position,
    state.opacity,
    state.rotation,
    state.margin,
    state.freeX,
    state.freeY,
    getRenderOpts,
  ]);

  const canvasCoords = useCallback((clientX: number, clientY: number): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0.5, 0.5];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const nextX = ((clientX - rect.left) * scaleX) / canvas.width;
    const nextY = ((clientY - rect.top) * scaleY) / canvas.height;
    return [Math.min(1, Math.max(0, nextX)), Math.min(1, Math.max(0, nextY))];
  }, []);

  const handlePointerEnd = useCallback((pointerId?: number) => {
    if (
      pointerId != null &&
      activePointerIdRef.current != null &&
      activePointerIdRef.current !== pointerId
    ) {
      return;
    }
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (state.position !== 'free' || !e.isPrimary) return;
      isDraggingRef.current = true;
      activePointerIdRef.current = e.pointerId;
      e.currentTarget.setPointerCapture(e.pointerId);
      const [x, y] = canvasCoords(e.clientX, e.clientY);
      dispatch({ type: 'SET_FREE_POS', x, y });
    },
    [state.position, canvasCoords, dispatch],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (
        !isDraggingRef.current ||
        state.position !== 'free' ||
        activePointerIdRef.current == null ||
        activePointerIdRef.current !== e.pointerId
      ) {
        return;
      }
      const [x, y] = canvasCoords(e.clientX, e.clientY);
      dispatch({ type: 'SET_FREE_POS', x, y });
    },
    [state.position, canvasCoords, dispatch],
  );

  // Allow dropping a new image onto the canvas
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file?.type.startsWith('image/')) {
        try {
          const img = await loadImageFile(file);
          dispatch({ type: 'SET_SOURCE', img, file });
          toast('Image loaded ✓');
        } catch {
          toast('Failed to load image');
        }
      }
    },
    [dispatch, toast],
  );

  if (!state.sourceImg) return null;

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      className={`max-h-full max-w-full select-none rounded-(--radius) shadow-(--shadow) ${state.position === 'free' ? 'cursor-crosshair touch-none' : 'cursor-default'}`}
      style={{ touchAction: state.position === 'free' ? 'none' : 'auto' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => handlePointerEnd(e.pointerId)}
      onPointerCancel={(e) => handlePointerEnd(e.pointerId)}
      onPointerLeave={() => handlePointerEnd()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    />
  );
}
