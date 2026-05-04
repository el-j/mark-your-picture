import { useWatermark } from '../../contexts/WatermarkContext';
import { DropZone } from './DropZone';
import { WatermarkCanvas } from './WatermarkCanvas';

export function CanvasArea() {
  const { state } = useWatermark();

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center relative overflow-auto p-4 max-[899px]:pb-[calc(64px+1rem)]"
      style={{
        background: `repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%) 0 0 / 20px 20px`,
      }}
    >
      {!state.sourceImg ? <DropZone /> : <WatermarkCanvas />}
    </section>
  );
}
