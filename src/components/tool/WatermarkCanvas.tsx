import { useCallback, useEffect, useRef } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { loadImageFile, renderWatermark } from '../../lib/watermark';

export function WatermarkCanvas() {
  const { state, dispatch, getRenderOpts } = useWatermark();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);

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
    return [
      ((clientX - rect.left) * scaleX) / canvas.width,
      ((clientY - rect.top) * scaleY) / canvas.height,
    ];
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (state.position !== 'free') return;
      isDraggingRef.current = true;
      const [x, y] = canvasCoords(e.clientX, e.clientY);
      dispatch({ type: 'SET_FREE_POS', x, y });
    },
    [state.position, canvasCoords, dispatch],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggingRef.current || state.position !== 'free') return;
      const [x, y] = canvasCoords(e.clientX, e.clientY);
      dispatch({ type: 'SET_FREE_POS', x, y });
    },
    [state.position, canvasCoords, dispatch],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (state.position !== 'free') return;
      e.preventDefault();
      isDraggingRef.current = true;
      const touch = e.touches[0];
      const [x, y] = canvasCoords(touch.clientX, touch.clientY);
      dispatch({ type: 'SET_FREE_POS', x, y });
    },
    [state.position, canvasCoords, dispatch],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current || state.position !== 'free') return;
      e.preventDefault();
      const touch = e.touches[0];
      const [x, y] = canvasCoords(touch.clientX, touch.clientY);
      dispatch({ type: 'SET_FREE_POS', x, y });
    },
    [state.position, canvasCoords, dispatch],
  );

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

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
      className={`max-h-full max-w-full rounded-(--radius) shadow-(--shadow) ${state.position === 'free' ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    />
  );
}
