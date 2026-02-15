
// @ts-ignore
import JSZip from 'jszip';
import { state } from '../core/state';
import { DEVICE_PRESETS } from '../core/config';
import { drawSlideContent, setCanvas, getCanvasContext, renderCanvas } from './Canvas';
import { $ } from '../core/utils';

// ============================================================
// EXPORT INITIALIZATION
// ============================================================
export function initExport() {
  $('#btn-export')?.addEventListener('click', openExportModal);
  $('#btn-download-all')?.addEventListener('click', openExportModal);
  $('#close-export-modal')?.addEventListener('click', closeExportModal);
  $('#cancel-export')?.addEventListener('click', closeExportModal);
  $('#start-export')?.addEventListener('click', handleExport);
}

// ============================================================
// MODAL LOGIC
// ============================================================
function openExportModal() {
  const modal = document.getElementById('export-modal');
  if (modal) {
    modal.classList.add('open'); // Use class for animation
    modal.style.display = 'flex'; // Ensure flex layout
  }
}

function closeExportModal() {
  const modal = document.getElementById('export-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      if (!modal.classList.contains('open')) modal.style.display = 'none';
    }, 200);
  }
  
  // Reset progress
  const progress = document.getElementById('export-progress');
  if (progress) progress.style.display = 'none';
  
  const fill = document.querySelector('.progress-bar-fill') as HTMLElement;
  if (fill) fill.style.width = '0%';
}

// ============================================================
// EXPORT HANDLER
// ============================================================
async function handleExport() {
  const iphoneCheck = (document.getElementById('export-apple-iphone') as HTMLInputElement).checked;
  const ipadCheck = (document.getElementById('export-apple-ipad') as HTMLInputElement).checked;
  const androidCheck = (document.getElementById('export-android') as HTMLInputElement).checked;
  
  if (!iphoneCheck && !ipadCheck && !androidCheck) {
    alert('Please select at least one device group.');
    return;
  }
  
  // Show progress
  const progress = document.getElementById('export-progress');
  if (progress) progress.style.display = 'block';
  const progressText = document.querySelector('.progress-text') as HTMLElement;
  const progressFill = document.querySelector('.progress-bar-fill') as HTMLElement;
  
  // Collect target presets
  const targets: string[] = [];
  if (iphoneCheck) targets.push('iphone-6.7', 'iphone-6.5', 'iphone-5.5');
  if (ipadCheck) targets.push('ipad-12.9', 'ipad-11');
  if (androidCheck) targets.push('android-16:9');
  
  const zip = new JSZip();
  const exportFolder = zip.folder('Export');
  
  // Save current state
  const { canvas: originalCanvas } = getCanvasContext();
  const originalPreset = state.devicePreset;
  const originalSelection = state.selectedStickerId;
  
  // Clear selection for clean export
  state.selectedStickerId = null;
  
  // Create offscreen canvas
  const offCanvas = document.createElement('canvas');
  setCanvas(offCanvas);
  
  let completed = 0;
  const totalOps = targets.length * state.slides.length;
  
  try {
    for (const presetKey of targets) {
      state.devicePreset = presetKey;
      const preset = DEVICE_PRESETS[presetKey];
      const folderName = preset.label.replace(/[":]/g, '').trim();
      const deviceFolder = exportFolder?.folder(folderName);
      
      // Update canvas size
      offCanvas.width = preset.width;
      offCanvas.height = preset.height;
      
      for (let i = 0; i < state.slides.length; i++) {
        const slide = state.slides[i];
        
        // Render
        drawSlideContent(slide, preset, i, state.slides.length);
        
        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          offCanvas.toBlob((b) => resolve(b!), 'image/png');
        });
        
        // Add to zip (add leading zero if needed, though usually file system sorts ok)
        const filename = `screenshot_${i + 1}.png`;
        deviceFolder?.file(filename, blob);
        
        // Update progress
        completed++;
        const pct = Math.round((completed / totalOps) * 100);
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressText) progressText.innerText = `Generating ${folderName} (${i + 1}/${state.slides.length})...`;
        
        // Small delay to allow UI update
        await new Promise(r => setTimeout(r, 10));
      }
    }
    
    if (progressText) progressText.innerText = 'Zipping files...';
    
    // Generate zip
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'AppScreenshots.zip';
    link.click();
    
    closeExportModal();
    
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Check console for details.');
  } finally {
    // Restore state
    setCanvas(originalCanvas);
    state.devicePreset = originalPreset;
    state.selectedStickerId = originalSelection;
    renderCanvas(); // Redraw UI
  }
}
