import { useAppStore } from '../../store/useAppStore';
import { FONT_FAMILIES } from '../../core/config';

export function TextPanel() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  return (
    <div className="properties-panel__content">
      <div className="panel-section">
        <div className="panel-section__title">Title</div>
        <textarea
          id="slide-title"
          rows={2}
          value={slide.title}
          onChange={(e) => updateActiveSlide({ title: e.target.value })}
        />

        <div className="panel-field mt-2">
          <label>Color</label>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={slide.titleColor}
              id="title-color"
              onChange={(e) => updateActiveSlide({ titleColor: e.target.value })}
            />
            <span className="color-value">{slide.titleColor}</span>
          </div>
        </div>

        <div className="panel-field">
          <label>Size</label>
          <div className="range-row">
            <input
              type="range"
              min={20}
              max={200}
              value={slide.titleSize}
              id="title-size"
              onChange={(e) => updateActiveSlide({ titleSize: parseInt(e.target.value) })}
            />
            <span className="range-value">{slide.titleSize}</span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section__title">Subtitle</div>
        <textarea
          id="slide-subtitle"
          rows={2}
          value={slide.subtitle}
          onChange={(e) => updateActiveSlide({ subtitle: e.target.value })}
        />

        <div className="panel-field mt-2">
          <label>Color</label>
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={slide.subtitleColor}
              id="subtitle-color"
              onChange={(e) => updateActiveSlide({ subtitleColor: e.target.value })}
            />
            <span className="color-value">{slide.subtitleColor}</span>
          </div>
        </div>

        <div className="panel-field">
          <label>Size</label>
          <div className="range-row">
            <input
              type="range"
              min={14}
              max={100}
              value={slide.subtitleSize}
              id="subtitle-size"
              onChange={(e) => updateActiveSlide({ subtitleSize: parseInt(e.target.value) })}
            />
            <span className="range-value">{slide.subtitleSize}</span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section__title">Typography</div>
        <div className="panel-field">
          <label>Font Family</label>
          <select
            id="font-family"
            value={slide.fontFamily}
            onChange={(e) => updateActiveSlide({ fontFamily: e.target.value })}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="panel-field mt-2">
          <label>Alignment</label>
          <div className="btn-group">
            {(['left', 'center', 'right'] as CanvasTextAlign[]).map((align) => (
              <button
                key={align}
                className={`icon-btn${slide.titleAlign === align ? ' active' : ''}`}
                data-align={align}
                onClick={() => updateActiveSlide({ titleAlign: align, titlePos: null, subtitlePos: null })}
              >
                <span className="material-symbols-rounded">
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
