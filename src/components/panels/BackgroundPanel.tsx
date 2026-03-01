import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLOR_PRESETS, GRADIENT_PRESETS, PRESET_BACKGROUNDS } from '../../core/config';

export function BackgroundPanel() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

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
        updateActiveSlide({ bgType: 'image', bgImage: ev.target.result as string });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div id="bg-panel-inline">
      <div className="bg-tabs">
        {(['solid', 'gradient', 'image'] as const).map((tab) => (
          <button
            key={tab}
            className={`bg-tab${activeTab === tab ? ' active' : ''}`}
            data-tab={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'solid' && (
        <div className="bg-content">
          <div className="color-grid">
            {COLOR_PRESETS.map((c) => (
              <div
                key={c}
                className={`color-swatch${slide.bgType === 'solid' && slide.bgColor === c ? ' active' : ''}`}
                style={{ background: c }}
                data-color={c}
                onClick={() => updateActiveSlide({ bgType: 'solid', bgColor: c })}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="bg-content">
          <div className="gradient-presets">
            {GRADIENT_PRESETS.map((g) => (
              <div
                key={g}
                className={`gradient-presets__item${slide.bgType === 'gradient' && slide.bgGradient === g ? ' active' : ''}`}
                style={{ background: g }}
                data-gradient={g}
                onClick={() => updateActiveSlide({ bgType: 'gradient', bgGradient: g })}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'image' && (
        <div className="bg-content">
          <div className="mb-4">
            <label
              className="btn-secondary w-full"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', padding: 8 }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>upload_file</span>
              <span>Upload Background</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgImageUpload} />
            </label>
          </div>

          <div className="sidebar-section__subtitle mb-2">Presets</div>
          <div className="image-grid">
            {PRESET_BACKGROUNDS.map((img) => (
              <div
                key={img}
                className={`image-preset${slide.bgType === 'image' && slide.bgImage === img ? ' active' : ''}`}
                style={{ backgroundImage: `url(${img})` }}
                data-img={img}
                onClick={() => updateActiveSlide({ bgType: 'image', bgImage: img })}
              />
            ))}
          </div>

          {slide.bgType === 'image' && (
            <div className="mt-4" style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn-secondary w-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => updateActiveSlide({ bgType: 'solid', bgImage: null })}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
                Remove Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
