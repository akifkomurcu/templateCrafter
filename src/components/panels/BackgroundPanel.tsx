import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLOR_PRESETS, GRADIENT_PRESETS, PRESET_BACKGROUNDS } from '../../core/config';

export function BackgroundPanel() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);
  const updateAllSlides = useAppStore((s) => s.updateAllSlides);

  const slide = slides[activeSlideIndex];
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'image'>(
    slide?.bgType === 'image' ? 'image' : slide?.bgType === 'gradient' ? 'gradient' : 'solid'
  );

  if (!slide) return null;

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        updateAllSlides({ bgType: 'image', bgImage: ev.target.result as string });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-stone-100 dark:bg-panel-dark rounded-lg p-1 border border-border-light dark:border-stone-700">
        {(['solid', 'gradient', 'image'] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white dark:bg-stone-600 shadow-sm text-stone-900 dark:text-white' : 'text-stone-500 hover:text-stone-800 dark:hover:text-white'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-[100px]">
        {activeTab === 'solid' && (
          <div className="grid grid-cols-5 gap-3">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${slide.bgType === 'solid' && slide.bgColor === c ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-stone-200 dark:border-stone-700'}`}
                style={{ background: c }}
                onClick={() => updateActiveSlide({ bgType: 'solid', bgColor: c })}
              />
            ))}
          </div>
        )}

        {activeTab === 'gradient' && (
          <div className="grid grid-cols-3 gap-3">
            {GRADIENT_PRESETS.map((g) => (
              <button
                key={g}
                className={`h-12 rounded-lg border-2 transition-all hover:opacity-90 ${slide.bgType === 'gradient' && slide.bgGradient === g ? 'border-primary ring-2 ring-primary/20' : 'border-stone-200 dark:border-stone-700'}`}
                style={{ background: g }}
                onClick={() => updateActiveSlide({ bgType: 'gradient', bgGradient: g })}
              />
            ))}
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            <label className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-panel-dark border border-dashed border-stone-300 dark:border-stone-600 rounded-xl text-stone-500 hover:border-primary hover:text-primary transition-all cursor-pointer group shadow-sm">
              <span className="material-icons-round text-xl group-hover:scale-110 transition-transform">upload_file</span>
              <span className="text-xs font-bold uppercase tracking-widest">Upload Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
            </label>

            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Presets</div>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_BACKGROUNDS.map((img) => (
                <button
                  key={img}
                  className={`aspect-[9/16] rounded-lg bg-cover bg-center border-2 transition-all hover:ring-2 ring-primary/20 ${slide.bgType === 'image' && slide.bgImage === img ? 'border-primary' : 'border-stone-200 dark:border-stone-700'}`}
                  style={{ backgroundImage: `url(${img})` }}
                  onClick={() => updateAllSlides({ bgType: 'image', bgImage: img })}
                />
              ))}
            </div>

            {slide.bgType === 'image' && (
              <button
                className="w-full py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-lg text-xs font-medium hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 border border-border-light dark:border-border-dark"
                onClick={() => updateAllSlides({ bgType: 'solid', bgImage: null })}
              >
                <span className="material-icons-round text-sm">close</span>
                Remove Image
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
