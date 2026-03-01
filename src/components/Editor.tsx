import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { SlideStrip } from './SlideStrip';
import { Viewport } from './Viewport';
import { FloatingToolbar } from './FloatingToolbar';
import { ZoomIndicator } from './ZoomIndicator';
import { ExportModal } from './ExportModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function Editor() {
  useKeyboardShortcuts();

  return (
    <div id="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar />
      <main className="editor">
        <Sidebar />
        <div className="editor-main">
          <SlideStrip />
          <Viewport />
          <FloatingToolbar />
          <ZoomIndicator />
        </div>
      </main>
      <ExportModal />
    </div>
  );
}
