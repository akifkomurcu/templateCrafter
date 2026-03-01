import { useAppStore } from '../store/useAppStore';

export function FloatingToolbar() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  return (
    <div id="floating-toolbar" className="visible">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn${slide.showDevice ? ' active' : ''}`}
          id="tb-frame"
          title="Toggle Device Frame"
          onClick={() => updateActiveSlide({ showDevice: !slide.showDevice })}
        >
          <span className="material-symbols-rounded">smartphone</span>
        </button>
      </div>

      <div className="toolbar-group">
        <div className="toolbar-slider-container">
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>zoom_out</span>
          <input
            type="range"
            className="toolbar-slider"
            id="tb-zoom"
            min={50}
            max={150}
            value={slide.deviceScale}
            onChange={(e) => updateActiveSlide({ deviceScale: parseInt(e.target.value) })}
          />
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>zoom_in</span>
        </div>
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          id="tb-move-up"
          title="Move Device Up"
          onClick={() => updateActiveSlide({ deviceOffsetY: slide.deviceOffsetY - 5 })}
        >
          <span className="material-symbols-rounded">arrow_upward</span>
        </button>
        <button
          className="toolbar-btn"
          id="tb-move-down"
          title="Move Device Down"
          onClick={() => updateActiveSlide({ deviceOffsetY: slide.deviceOffsetY + 5 })}
        >
          <span className="material-symbols-rounded">arrow_downward</span>
        </button>
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          id="tb-reset"
          title="Reset Slide"
          onClick={() => updateActiveSlide({ deviceScale: 85, deviceOffsetY: 10, showDevice: true })}
        >
          <span className="material-symbols-rounded">restart_alt</span>
        </button>
      </div>
    </div>
  );
}
