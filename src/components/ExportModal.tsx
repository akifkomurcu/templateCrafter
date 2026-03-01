import { useState } from 'react';
// @ts-ignore
import JSZip from 'jszip';
import { useAppStore } from '../store/useAppStore';
import { DEVICE_PRESETS } from '../core/config';
import { drawSlideContent } from '../canvas/drawSlideContent';

export function ExportModal() {
  const exportModalOpen = useAppStore((s) => s.exportModalOpen);
  const setExportModalOpen = useAppStore((s) => s.setExportModalOpen);
  const slides = useAppStore((s) => s.slides);
  const deviceColor = useAppStore((s) => s.deviceColor);
  const showNotch = useAppStore((s) => s.showNotch);

  const [selectedDevices, setSelectedDevices] = useState({
    iphone: true,
    ipad: true,
    android: false,
  });
  const [progress, setProgress] = useState<{ pct: number; label: string } | null>(null);

  if (!exportModalOpen) return null;

  const close = () => {
    setExportModalOpen(false);
    setProgress(null);
  };

  const toggleDevice = (key: keyof typeof selectedDevices) => {
    setSelectedDevices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = async () => {
    const targets: string[] = [];
    if (selectedDevices.iphone) targets.push('iphone-6.7', 'iphone-6.5', 'iphone-5.5');
    if (selectedDevices.ipad) targets.push('ipad-12.9', 'ipad-11');
    if (selectedDevices.android) targets.push('android-16:9');

    if (targets.length === 0) {
      alert('Please select at least one device group.');
      return;
    }

    const zip = new JSZip();
    const exportFolder = zip.folder('Export');
    const offCanvas = document.createElement('canvas');
    let completed = 0;
    const totalOps = targets.length * slides.length;

    try {
      for (const presetKey of targets) {
        const preset = DEVICE_PRESETS[presetKey];
        const folderName = preset.label.replace(/[":]/g, '').trim();
        const deviceFolder = exportFolder?.folder(folderName);

        offCanvas.width = preset.width;
        offCanvas.height = preset.height;
        const ctx = offCanvas.getContext('2d')!;

        for (let i = 0; i < slides.length; i++) {
          drawSlideContent(
            ctx,
            slides[i],
            preset,
            presetKey,
            deviceColor,
            showNotch,
            i,
            slides.length,
            false,
            false,
            null,
            () => {}
          );

          const blob = await new Promise<Blob>((resolve) => {
            offCanvas.toBlob((b) => resolve(b!), 'image/png');
          });

          deviceFolder?.file(`screenshot_${i + 1}.png`, blob);
          completed++;
          const pct = Math.round((completed / totalOps) * 100);
          setProgress({ pct, label: `Generating ${folderName} (${i + 1}/${slides.length})...` });
          await new Promise((r) => setTimeout(r, 10));
        }
      }

      setProgress({ pct: 100, label: 'Zipping files...' });
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'AppScreenshots.zip';
      link.click();
      close();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Check console for details.');
      setProgress(null);
    }
  };

  return (
    <div className="modal-overlay open" id="export-modal" style={{ display: 'flex' }}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3 className="modal-title">Export Screenshots</h3>
          <button className="icon-btn" id="close-export-modal" onClick={close}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--c-text-secondary)', marginBottom: 'var(--sp-4)' }}>
            Generate submission-ready screenshots for all selected sizes in one click.
          </p>

          <div className="device-selection-group">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                id="export-apple-iphone"
                checked={selectedDevices.iphone}
                onChange={() => toggleDevice('iphone')}
              />
              <div className="checkbox-label">
                <span className="label-title">Apple iPhones</span>
                <span className="label-desc">6.7" (1290×2796), 6.5" (1284×2778), 5.5" (1242×2208)</span>
              </div>
            </label>

            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                id="export-apple-ipad"
                checked={selectedDevices.ipad}
                onChange={() => toggleDevice('ipad')}
              />
              <div className="checkbox-label">
                <span className="label-title">Apple iPads</span>
                <span className="label-desc">12.9" (2048×2732), 11" (1668×2388)</span>
              </div>
            </label>

            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                id="export-android"
                checked={selectedDevices.android}
                onChange={() => toggleDevice('android')}
              />
              <div className="checkbox-label">
                <span className="label-title">Android</span>
                <span className="label-desc">Phone (1080×1920)</span>
              </div>
            </label>
          </div>

          {progress && (
            <div className="export-progress" id="export-progress" style={{ marginTop: 20 }}>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress.pct}%` }} />
              </div>
              <div className="progress-text" style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--c-text-secondary)' }}>
                {progress.label}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" id="cancel-export" onClick={close}>Cancel</button>
          <button className="btn-primary" id="start-export" onClick={handleExport}>
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
