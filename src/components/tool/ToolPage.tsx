import { useState } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useT } from '../../i18n/index';
import { BottomSheet } from '../ui/BottomSheet';
import { ActionButtons } from './ActionButtons';
import { BatchPanel } from './BatchPanel';
import { CanvasArea } from './CanvasArea';
import { type MobilePanelType, MobileToolbar } from './MobileToolbar';
import { ModeSelector } from './ModeSelector';
import { PositionStyleCard } from './PositionStyleCard';
import { Sidebar } from './Sidebar';
import { WatermarkTypeCard } from './WatermarkTypeCard';

export function ToolPage() {
  const { state } = useWatermark();
  const t = useT();
  const [activePanel, setActivePanel] = useState<MobilePanelType>(null);

  const closePanel = () => setActivePanel(null);

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-[900px]:flex-row">
      <CanvasArea />
      <Sidebar />

      {/* Mobile Toolbar (hidden on desktop) */}
      <MobileToolbar activePanel={activePanel} onOpenPanel={setActivePanel} />

      {/* Mobile Bottom Sheets */}
      <BottomSheet
        isOpen={activePanel === 'mode'}
        onClose={closePanel}
        title={t('bottomSheet.selectMode')}
      >
        <ModeSelector />
        {state.mode === 'batch' && (
          <div className="mt-2">
            <BatchPanel />
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        isOpen={activePanel === 'watermark'}
        onClose={closePanel}
        title={t('bottomSheet.watermark')}
      >
        <WatermarkTypeCard />
      </BottomSheet>

      <BottomSheet
        isOpen={activePanel === 'position'}
        onClose={closePanel}
        title={t('bottomSheet.positionStyle')}
      >
        <PositionStyleCard />
      </BottomSheet>

      <BottomSheet
        isOpen={activePanel === 'export'}
        onClose={closePanel}
        title={t('bottomSheet.actionsExport')}
      >
        <ActionButtons />
      </BottomSheet>
    </div>
  );
}
