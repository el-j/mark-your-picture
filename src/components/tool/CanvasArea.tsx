import { useWatermark } from '../../contexts/WatermarkContext';
import { DropZone } from './DropZone';
import { WatermarkCanvas } from './WatermarkCanvas';

export function CanvasArea() {
  const { state } = useWatermark();

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center relative overflow-auto min-h-[220px] max-[899px]:min-h-[260px] max-[899px]:max-h-[55vh] p-4"
      style={{
        background: `repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%) 0 0 / 20px 20px`,
      }}
    >
      {!state.sourceImg ? <DropZone /> : <WatermarkCanvas />}
    </section>
  );
}
