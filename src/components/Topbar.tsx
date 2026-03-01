import { useState, useRef, useEffect } from 'react';
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
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        gearRef.current && !gearRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  const currentPreset = DEVICE_PRESETS[devicePreset];
  const category = currentPreset?.category ?? 'iphone';
  const categoryLabel = category === 'iphone' ? 'iPhone' : category === 'ipad' ? 'iPad' : 'Android';

  const colorDots: Record<string, string> = {
    black: '#1c1c1e',
    silver: '#c8c8cc',
    gold: '#c8a860',
  };

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 shrink-0 z-20 shadow-sm transition-colors duration-200">
      {/* Left */}
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-xl tracking-tight text-stone-800 dark:text-stone-50 font-display">ScreenCraft</h1>
      </div>

      {/* Center: device summary + gear */}
      <div className="flex items-center gap-3 relative">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-panel-dark border border-border-light dark:border-border-dark rounded-lg shadow-sm text-xs text-stone-600 dark:text-stone-300 font-medium select-none">
          <span className="material-icons-round text-sm text-stone-400">
            {category === 'ipad' ? 'tablet_mac' : 'smartphone'}
          </span>
          <span>{categoryLabel}</span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span className="text-stone-400 dark:text-stone-500">{currentPreset?.width}×{currentPreset?.height}</span>
          <span
            className="w-3 h-3 rounded-full border border-stone-200 dark:border-stone-600 ml-1"
            style={{ background: colorDots[deviceColor] ?? '#1c1c1e' }}
          />
        </div>

        <button
          ref={gearRef}
          className={`p-2 rounded-full transition-colors ${settingsOpen ? 'bg-primary/10 text-primary' : 'text-stone-400 hover:bg-sage-100 dark:hover:bg-panel-dark hover:text-stone-700 dark:hover:text-white'}`}
          onClick={() => setSettingsOpen((v) => !v)}
          title="Device settings"
        >
          <span className="material-icons-round text-lg">settings</span>
        </button>

        {/* Popover */}
        {settingsOpen && (
          <div
            ref={popoverRef}
            className="absolute top-12 left-1/2 -translate-x-1/2 w-72 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-2xl p-5 z-50 space-y-5"
          >
            {/* Device preset */}
            <div>
              <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Device</p>
              <div className="space-y-1">
                {(['iphone', 'ipad', 'android'] as const).map((cat) => {
                  const entries = Object.entries(DEVICE_PRESETS).filter(([, v]) => v.category === cat);
                  if (!entries.length) return null;
                  const catLabel = cat === 'iphone' ? 'iPhone' : cat === 'ipad' ? 'iPad' : 'Android';
                  return (
                    <div key={cat}>
                      <p className="text-[9px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest px-1 mb-1">{catLabel}</p>
                      {entries.map(([key, val]) => (
                        <button
                          key={key}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            devicePreset === key
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-panel-dark'
                          }`}
                          onClick={() => setDevicePreset(key)}
                        >
                          <span>{val.label}</span>
                          {devicePreset === key && <span className="material-icons-round text-sm">check</span>}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-2">Frame Color</p>
              <div className="flex gap-2">
                {Object.entries(colorDots).map(([key, hex]) => (
                  <button
                    key={key}
                    className={`flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                      deviceColor === key
                        ? 'border-primary text-primary'
                        : 'border-transparent bg-stone-100 dark:bg-panel-dark text-stone-500 hover:border-stone-300'
                    }`}
                    onClick={() => setDeviceColor(key)}
                  >
                    <span className="w-3 h-3 rounded-full border border-stone-200 dark:border-stone-600 shrink-0" style={{ background: hex }} />
                    <span className="capitalize">{key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notch / Dynamic Island */}
            {category !== 'android' && (
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  {category === 'ipad' ? 'Face ID' : 'Dynamic Island'}
                </p>
                <button
                  type="button"
                  className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none ${showNotch ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-600'}`}
                  onClick={() => setShowNotch(!showNotch)}
                >
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] shadow-sm transition-transform duration-200 ${showNotch ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-sage-100 dark:hover:bg-panel-dark rounded-xl transition-all"
          onClick={toggleDarkMode}
          title="Toggle Theme"
        >
          <span className="material-icons-round text-xl">{darkMode ? 'dark_mode' : 'light_mode'}</span>
        </button>

        <button
          className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all border border-primary/20"
          onClick={() => setExportModalOpen(true)}
        >
          <span className="material-icons-round text-sm">download</span>
          Export
        </button>
      </div>
    </header>
  );
}
