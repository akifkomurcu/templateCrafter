import { useAppStore } from '../store/useAppStore';
import { UndoRedo } from './panels/UndoRedo';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { TextPanel } from './panels/TextPanel';
import { StickerPanel } from './panels/StickerPanel';
import { ScreenshotUpload } from './panels/ScreenshotUpload';
import { TEMPLATE_COLORS } from '../core/config';

export function Sidebar() {
  const activePanel = useAppStore((s) => s.activePanel);
  const setActivePanel = useAppStore((s) => s.setActivePanel);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

  const togglePanel = (panel: string) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <aside className="w-80 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col overflow-y-auto shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-colors duration-200 custom-scrollbar">
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-border-light dark:border-border-dark border-opacity-60">
        <UndoRedo />
      </div>

      {/* Palette Section */}
      <div className="p-6 border-b border-border-light dark:border-border-dark border-opacity-60">
        <h3 className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1 font-sans">Palette</h3>
        <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-4 italic font-serif opacity-80">Select your brand essence.</p>
        <div className="grid grid-cols-6 gap-2">
          {TEMPLATE_COLORS.slice(0, 12).map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700 cursor-pointer transition-all hover:scale-110 hover:shadow-md"
              style={{ backgroundColor: color }}
              onClick={() => updateActiveSlide({ bgColor: color, bgType: 'solid' })}
            />
          ))}
          <button className="w-8 h-8 rounded-full border border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-400 hover:border-primary hover:text-primary transition-colors">
            <span className="material-icons-round text-sm">add</span>
          </button>
        </div>
      </div>

      {/* Typography Section */}
      <div className="p-6 border-b border-border-light dark:border-border-dark border-opacity-60">
        <h3 className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4 font-sans">Typography</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            className={`bg-white dark:bg-panel-dark hover:bg-stone-50 dark:hover:bg-stone-800 border-2 ${activePanel === 'text' ? 'border-primary shadow-primary/10' : 'border-stone-100 dark:border-stone-800'} rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group shadow-sm`}
            onClick={() => togglePanel('text')}
          >
            <span className={`text-2xl font-bold mb-1 group-hover:scale-110 transition-transform font-serif ${activePanel === 'text' ? 'text-primary' : 'text-stone-800 dark:text-white'}`}>Aa</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">Heading</span>
          </button>
          <button 
            className={`bg-transparent border-2 border-transparent hover:bg-stone-50 dark:hover:bg-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group opacity-60 hover:opacity-100`}
            onClick={() => togglePanel('text')}
          >
            <span className="text-2xl font-normal text-stone-800 dark:text-white mb-1 group-hover:scale-110 transition-transform font-sans">Aa</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">Body</span>
          </button>
        </div>
        
        {activePanel === 'text' && (
          <div className="mt-6 p-4 bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-stone-100 dark:border-stone-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <TextPanel />
          </div>
        )}
      </div>

      {/* Assets Section */}
      <div className="p-6 border-b border-border-light dark:border-border-dark border-opacity-60">
        <h3 className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4 font-sans">Assets</h3>
        <StickerPanel />
      </div>

      {/* Background Section */}
      <div className="p-6">
        <h3 className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4 font-sans">Background</h3>
        <BackgroundPanel />
      </div>

      <div className="p-6 mt-auto border-t border-border-light dark:border-border-dark bg-stone-50/50 dark:bg-stone-900/20">
        <ScreenshotUpload />
      </div>
    </aside>
  );
}
