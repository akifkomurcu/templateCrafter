import { useAppStore } from '../store/useAppStore';
import { DEVICE_PRESETS } from '../core/config';

export function Topbar() {
  const devicePreset = useAppStore((s) => s.devicePreset);
  const deviceColor = useAppStore((s) => s.deviceColor);
  const showNotch = useAppStore((s) => s.showNotch);
  const setDevicePreset = useAppStore((s) => s.setDevicePreset);
  const setDeviceColor = useAppStore((s) => s.setDeviceColor);
  const setShowNotch = useAppStore((s) => s.setShowNotch);
  const setExportModalOpen = useAppStore((s) => s.setExportModalOpen);

  return (
    <header className="topbar">
      <div className="topbar__left">
        <span className="topbar__project-name">Template Crafter</span>
      </div>

      <div className="topbar__center">
        <div className="device-bar">
          <span className="device-bar__platform">App Store (iOS)</span>
          <div className="device-bar__divider"></div>
          <select
            className="device-selector"
            id="device-selector"
            value={devicePreset}
            onChange={(e) => setDevicePreset(e.target.value)}
          >
            <optgroup label="Apple – iPhones">
              {Object.entries(DEVICE_PRESETS)
                .filter(([, v]) => v.category === 'iphone')
                .map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
            </optgroup>
            <optgroup label="Apple – iPads">
              {Object.entries(DEVICE_PRESETS)
                .filter(([, v]) => v.category === 'ipad')
                .map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
            </optgroup>
            <optgroup label="Android – Phones">
              {Object.entries(DEVICE_PRESETS)
                .filter(([, v]) => v.category === 'android')
                .map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
            </optgroup>
          </select>

          <select
            className="device-color-selector"
            id="device-color-selector"
            value={deviceColor}
            onChange={(e) => setDeviceColor(e.target.value)}
          >
            <option value="black">● Black</option>
            <option value="silver">● Silver</option>
            <option value="gold">● Gold</option>
          </select>

          <div className="device-bar__divider"></div>

          <label className="toggle-label" id="notch-toggle-label">
            Dynamic Island
            <input
              type="checkbox"
              id="notch-toggle"
              checked={showNotch}
              onChange={(e) => setShowNotch(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="topbar__right">
        <button
          className="topbar__btn btn-primary"
          id="btn-export"
          title="Export"
          onClick={() => setExportModalOpen(true)}
        >
          <span className="material-symbols-rounded">download</span>
          Export
        </button>
      </div>
    </header>
  );
}
