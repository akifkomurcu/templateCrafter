import { useAppStore } from '../store/useAppStore';

export function FloatingToolbar() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center bg-white/95 dark:bg-[#1C1C1A]/95 backdrop-blur-xl border border-border-light dark:border-border-dark rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 gap-2 z-30 transition-all duration-300 hover:shadow-primary/20 animate-in slide-in-from-bottom-8 fade-in duration-700">
      <div className="flex items-center border-r border-stone-200 dark:border-stone-800 pr-2 mr-1">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${slide.showDevice ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
          title="Toggle Device Frame"
          onClick={() => updateActiveSlide({ showDevice: !slide.showDevice })}
        >
          <span className="material-symbols-rounded">smartphone</span>
        </button>
      </div>

      <div className="flex items-center gap-3 px-2">
        <span className="material-symbols-rounded text-stone-400 text-lg">zoom_out</span>
        <div className="relative flex items-center w-32 h-6">
           <input
            type="range"
            className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-primary"
            min={50}
            max={150}
            value={slide.deviceScale}
            onChange={(e) => updateActiveSlide({ deviceScale: parseInt(e.target.value) })}
          />
        </div>
        <span className="material-symbols-rounded text-stone-400 text-lg">zoom_in</span>
      </div>

      <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-3 ml-1">
        <button
          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          title="Move Device Up"
          onClick={() => {
            if (slide.devicePos) {
              updateActiveSlide({ devicePos: { x: slide.devicePos.x, y: slide.devicePos.y - 20 } });
            } else {
              updateActiveSlide({ deviceOffsetY: slide.deviceOffsetY - 5 });
            }
          }}
        >
          <span className="material-symbols-rounded">arrow_upward</span>
        </button>
        <button
          className="w-9 h-9 flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
          title="Move Device Down"
          onClick={() => {
            if (slide.devicePos) {
              updateActiveSlide({ devicePos: { x: slide.devicePos.x, y: slide.devicePos.y + 20 } });
            } else {
              updateActiveSlide({ deviceOffsetY: slide.deviceOffsetY + 5 });
            }
          }}
        >
          <span className="material-symbols-rounded">arrow_downward</span>
        </button>
      </div>

      <div className="flex items-center border-l border-stone-200 dark:border-stone-800 pl-2 ml-1">
        <button
          className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          title="Reset Slide"
          onClick={() => updateActiveSlide({ deviceScale: 85, deviceOffsetY: 10, devicePos: null, showDevice: true })}
        >
          <span className="material-symbols-rounded">restart_alt</span>
        </button>
      </div>
    </div>
  );
}
