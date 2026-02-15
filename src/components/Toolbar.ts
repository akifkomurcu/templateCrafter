import { state, triggerUpdate } from '../core/state';
import { $ } from '../core/utils';

export function renderToolbar() {
  const container = $('#floating-toolbar');
  if (!container) return;

  const slide = state.slides[state.activeSlideIndex];
  if (!slide) {
    container.classList.remove('visible');
    return;
  }
  
  // Show toolbar when a slide is active
  container.classList.add('visible');

  // Render Toolbar Content
  container.innerHTML = `
    <!-- Frame Toggle -->
    <div class="toolbar-group">
      <button class="toolbar-btn ${slide.showDevice ? 'active' : ''}" id="tb-frame" title="Toggle Device Frame">
        <span class="material-symbols-rounded">smartphone</span>
      </button>
    </div>

    <!-- Zoom Control -->
    <div class="toolbar-group">
      <div class="toolbar-slider-container">
        <span class="material-symbols-rounded" style="font-size:16px;">zoom_out</span>
        <input type="range" class="toolbar-slider" id="tb-zoom" min="50" max="150" value="${slide.deviceScale}">
        <span class="material-symbols-rounded" style="font-size:16px;">zoom_in</span>
      </div>
    </div>

    <!-- Position Control -->
    <div class="toolbar-group">
      <button class="toolbar-btn" id="tb-move-up" title="Move Device Up">
        <span class="material-symbols-rounded">arrow_upward</span>
      </button>
      <button class="toolbar-btn" id="tb-move-down" title="Move Device Down">
        <span class="material-symbols-rounded">arrow_downward</span>
      </button>
    </div>
    
    <!-- Reset -->
    <div class="toolbar-group">
      <button class="toolbar-btn" id="tb-reset" title="Reset Slide">
        <span class="material-symbols-rounded">restart_alt</span>
      </button>
    </div>
  `;

  // Bind Events
  
  // Frame
  $('#tb-frame')?.addEventListener('click', () => {
    slide.showDevice = !slide.showDevice;
    triggerUpdate();
  });

  // Zoom
  $('#tb-zoom')?.addEventListener('input', (e) => {
    slide.deviceScale = parseInt((e.target as HTMLInputElement).value);
    triggerUpdate();
  });

  // Position (Offset Y)
  $('#tb-move-up')?.addEventListener('click', () => {
    slide.deviceOffsetY -= 5;
    triggerUpdate();
  });

  $('#tb-move-down')?.addEventListener('click', () => {
    slide.deviceOffsetY += 5;
    triggerUpdate();
  });

  // Reset
  $('#tb-reset')?.addEventListener('click', () => {
    slide.deviceScale = 85;
    slide.deviceOffsetY = 10;
    slide.showDevice = true;
    triggerUpdate();
  });
}
