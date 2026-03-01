import { useAppStore } from '../store/useAppStore';
import { UndoRedo } from './panels/UndoRedo';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { TextPanel } from './panels/TextPanel';
import { StickerPanel } from './panels/StickerPanel';
import { DevicePanel } from './panels/DevicePanel';
import { ScreenshotUpload } from './panels/ScreenshotUpload';

export function Sidebar() {
  const activePanel = useAppStore((s) => s.activePanel);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const setExportModalOpen = useAppStore((s) => s.setExportModalOpen);

  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar__content" id="sidebar-content">
        <UndoRedo />

        {/* Text */}
        <div className="sidebar-section">
          <div className="sidebar-section__title">Text</div>
          <div className="sidebar-section__row">
            <button
              className={`sidebar-tool-btn${activePanel === 'text' ? ' active' : ''}`}
              id="btn-text-heading"
              onClick={() => togglePanel('text')}
            >
              <span className="tool-icon">H</span>
              <span className="tool-label">Heading</span>
            </button>
            <button
              className={`sidebar-tool-btn${activePanel === 'text' ? ' active' : ''}`}
              id="btn-text-body"
              onClick={() => togglePanel('text')}
            >
              <span className="tool-icon">T</span>
              <span className="tool-label">Body</span>
            </button>
          </div>
          {activePanel === 'text' && <TextPanel />}
        </div>

        {/* Stickers */}
        <div className="sidebar-section">
          <div className="sidebar-section__title">Stickers &amp; Assets</div>
          <StickerPanel />
        </div>

        {/* Background */}
        <div className="sidebar-section">
          <div className="sidebar-section__title">Background</div>
          <BackgroundPanel />
        </div>

        {/* Device */}
        <div className="sidebar-section">
          <div className="sidebar-section__title">Device</div>
          <button
            className={`sidebar-tool-btn${activePanel === 'device' ? ' active' : ''}`}
            onClick={() => togglePanel('device')}
          >
            <span className="tool-icon"><span className="material-symbols-rounded" style={{ fontSize: 16 }}>smartphone</span></span>
            <span className="tool-label">Device</span>
          </button>
          {activePanel === 'device' && <DevicePanel />}
        </div>

        {/* Screenshot Upload */}
        <ScreenshotUpload />

        {/* Download */}
        <div className="sidebar-section sidebar-section--bottom">
          <button
            className="sidebar-download-btn"
            id="btn-download-all"
            onClick={() => setExportModalOpen(true)}
          >
            <span className="material-symbols-rounded">download</span> Download Screenshots
          </button>
        </div>
      </div>
    </aside>
  );
}
