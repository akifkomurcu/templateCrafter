import { useAppStore } from '../../store/useAppStore';
import { FONT_FAMILIES } from '../../core/config';

export function TextPanel() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Title</label>
        <textarea
          className="w-full bg-white dark:bg-panel-dark border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-800 dark:text-stone-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none shadow-sm"
          rows={2}
          value={slide.title}
          placeholder="Enter title here..."
          onChange={(e) => updateActiveSlide({ title: e.target.value })}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block">Color</span>
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
              <input
                type="color"
                className="w-6 h-6 rounded-md cursor-pointer border-none bg-transparent"
                value={slide.titleColor}
                onChange={(e) => updateActiveSlide({ titleColor: e.target.value })}
              />
              <span className="text-[10px] font-mono text-stone-500">{slide.titleColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Size</span>
              <span className="text-[10px] font-mono text-stone-500">{slide.titleSize}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-primary"
              value={slide.titleSize}
              onChange={(e) => updateActiveSlide({ titleSize: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-100 dark:bg-stone-800/50 w-full" />

      {/* Subtitle Section */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Subtitle</label>
        <textarea
          className="w-full bg-white dark:bg-panel-dark border border-stone-200 dark:border-stone-700 rounded-xl p-3 text-sm text-stone-800 dark:text-stone-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none shadow-sm"
          rows={2}
          value={slide.subtitle}
          placeholder="Enter subtitle here..."
          onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block">Color</span>
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
              <input
                type="color"
                className="w-6 h-6 rounded-md cursor-pointer border-none bg-transparent"
                value={slide.subtitleColor}
                onChange={(e) => updateActiveSlide({ subtitleColor: e.target.value })}
              />
              <span className="text-[10px] font-mono text-stone-500">{slide.subtitleColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Size</span>
              <span className="text-[10px] font-mono text-stone-500">{slide.subtitleSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={100}
              className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-primary"
              value={slide.subtitleSize}
              onChange={(e) => updateActiveSlide({ subtitleSize: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-100 dark:bg-stone-800/50 w-full" />

      {/* Global Typography Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Font Family</label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-white dark:bg-panel-dark border border-stone-200 dark:border-stone-700 px-4 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer shadow-sm"
              value={slide.fontFamily}
              onChange={(e) => updateActiveSlide({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-lg">expand_more</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Alignment</label>
          <div className="flex bg-stone-100 dark:bg-stone-800/50 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            {(['left', 'center', 'right'] as CanvasTextAlign[]).map((align) => (
              <button
                key={align}
                className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${slide.titleAlign === align ? 'bg-white dark:bg-stone-700 shadow-sm text-primary scale-100' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                onClick={() => updateActiveSlide({ titleAlign: align, titlePos: null, subtitlePos: null })}
              >
                <span className="material-symbols-rounded text-xl">
                  {align === 'left' ? 'format_align_left' : align === 'center' ? 'format_align_center' : 'format_align_right'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
