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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 backdrop-blur-sm bg-black/40">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50 font-display">Export Screenshots</h3>
            <p className="text-xs text-stone-400 mt-1 italic font-serif">Generate submission-ready assets.</p>
          </div>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
            onClick={close}
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
            ScreenCraft will generate professional, high-resolution screenshots for all selected device groups in a single click.
          </p>

          <div className="space-y-4">
            <label className="flex items-center gap-4 group cursor-pointer bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 transition-all hover:border-primary/30">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-lg border-stone-300 dark:border-stone-700 text-primary focus:ring-primary cursor-pointer"
                checked={selectedDevices.iphone}
                onChange={() => toggleDevice('iphone')}
              />
              <div className="flex-1">
                <span className="block text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest leading-none">Apple iPhones</span>
                <span className="block text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">6.7" (1290×2796), 6.5" (1284×2778), 5.5" (1242×2208)</span>
              </div>
            </label>

            <label className="flex items-center gap-4 group cursor-pointer bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 transition-all hover:border-primary/30">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-lg border-stone-300 dark:border-stone-700 text-primary focus:ring-primary cursor-pointer"
                checked={selectedDevices.ipad}
                onChange={() => toggleDevice('ipad')}
              />
              <div className="flex-1">
                <span className="block text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest leading-none">Apple iPads</span>
                <span className="block text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">12.9" (2048×2732), 11" (1668×2388)</span>
              </div>
            </label>

            <label className="flex items-center gap-4 group cursor-pointer bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 transition-all hover:border-primary/30">
              <input
                type="checkbox"
                className="w-5 h-5 rounded-lg border-stone-300 dark:border-stone-700 text-primary focus:ring-primary cursor-pointer"
                checked={selectedDevices.android}
                onChange={() => toggleDevice('android')}
              />
              <div className="flex-1">
                <span className="block text-sm font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest leading-none">Android Devices</span>
                <span className="block text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">Universal (1080×1920)</span>
              </div>
            </label>
          </div>

          {progress && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-[10px] font-bold text-primary uppercase tracking-widest">
                <span>{progress.label}</span>
                <span>{progress.pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 shadow-[0_0_12px_rgba(119,140,125,0.4)]" 
                  style={{ width: `${progress.pct}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50 dark:bg-stone-900/30 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
          <button 
            className="px-6 py-2.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors text-sm font-bold uppercase tracking-widest"
            onClick={close}
          >
            Cancel
          </button>
          <button 
            className="px-8 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all uppercase tracking-widest flex items-center gap-2"
            onClick={handleExport}
          >
            <span className="material-symbols-rounded text-lg">download</span>
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
