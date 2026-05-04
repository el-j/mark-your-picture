import { CanvasArea } from './CanvasArea';
import { Sidebar } from './Sidebar';

export function ToolPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-[900px]:flex-row">
      <CanvasArea />
      <Sidebar />
    </div>
  );
}
