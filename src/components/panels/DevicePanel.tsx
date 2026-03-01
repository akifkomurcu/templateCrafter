import { useAppStore } from '../../store/useAppStore';

export function DevicePanel() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const updateActiveSlide = useAppStore((s) => s.updateActiveSlide);

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  return (
    <div className="properties-panel__content">
      <div className="panel-section">
        <div className="panel-section__title">Device Frame</div>
        <div className="toggle-row">
          <span className="toggle-row__label">Show Device</span>
          <div
            className={`toggle${slide.showDevice ? ' active' : ''}`}
            id="toggle-device"
            onClick={() => updateActiveSlide({ showDevice: !slide.showDevice })}
          />
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section__title">Position &amp; Size</div>
        <div className="panel-field">
          <label>Vertical Position</label>
          <div className="range-row">
            <input
              type="range"
              min={0}
              max={60}
              value={slide.deviceOffsetY}
              id="device-pos-y"
              onChange={(e) => updateActiveSlide({ deviceOffsetY: parseInt(e.target.value) })}
            />
            <span className="range-value">{slide.deviceOffsetY}%</span>
          </div>
        </div>
        <div className="panel-field">
          <label>Scale</label>
          <div className="range-row">
            <input
              type="range"
              min={30}
              max={100}
              value={slide.deviceScale}
              id="device-scale-ctrl"
              onChange={(e) => updateActiveSlide({ deviceScale: parseInt(e.target.value) })}
            />
            <span className="range-value">{slide.deviceScale}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
