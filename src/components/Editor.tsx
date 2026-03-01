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
    <div className="h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-200">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col relative min-w-0">
          <SlideStrip />
          <Viewport />
          <FloatingToolbar />
        </main>
      </div>
      <ExportModal />
    </div>
  );
}
