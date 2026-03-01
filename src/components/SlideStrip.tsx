import { useAppStore } from '../store/useAppStore';
import { SlideThumb } from './SlideThumb';

export function SlideStrip() {
  const slides = useAppStore((s) => s.slides);
  const addSlide = useAppStore((s) => s.addSlide);
  const isPinned = useAppStore((s) => s.isSlideStripPinned);
  const togglePin = useAppStore((s) => s.toggleSlideStripPinned);

  return (
    <div className={`group/strip relative transition-all duration-500 ease-in-out border-b border-border-light dark:border-border-dark bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] z-20 ${isPinned ? 'h-40' : 'h-8 hover:h-40'}`}>
      {/* Pin Button */}
      <button
        onClick={togglePin}
        className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 ${isPinned ? 'bg-primary text-white scale-110' : 'text-stone-400 opacity-0 group-hover/strip:opacity-100 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
        title={isPinned ? "Unpin Slide Tray" : "Pin Slide Tray"}
      >
        <span className="material-symbols-rounded text-base">{isPinned ? 'push_pin' : 'keep'}</span>
      </button>

      {/* Visual Indicator */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-200 dark:bg-stone-800 rounded-t-full transition-opacity duration-300 ${(isPinned) ? 'opacity-0' : 'group-hover/strip:opacity-0'}`} />
      
      <div className={`h-full flex items-center px-8 gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar transition-opacity duration-300 ${(isPinned) ? 'opacity-100' : 'opacity-0 group-hover/strip:opacity-100'}`}>
        <div className="flex items-center gap-6 h-full">
          {slides.map((_, index) => (
            <SlideThumb key={index} index={index} />
          ))}
        </div>
        
        <button
          className="w-16 h-24 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all text-stone-400 dark:text-stone-500 flex-shrink-0"
          onClick={addSlide}
          title="Add Screenshot"
        >
          <span className="material-symbols-rounded text-xl">add_circle</span>
          <span className="text-[9px] font-bold uppercase tracking-widest">Add</span>
        </button>
      </div>
    </div>
  );
}
