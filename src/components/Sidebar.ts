
import { state, triggerUpdate, setActiveSlide, deleteSlide, duplicateSlide, moveSlide, saveSnapshot, undo, redo, addSlide } from '../core/state';
import { DEVICE_PRESETS, COLOR_PRESETS, GRADIENT_PRESETS, PRESET_BACKGROUNDS, FONT_FAMILIES, STICKER_EMOJIS } from '../core/config';
// import type { DevicePreset, SlideData } from '../core/types';
import { $, $$, uid } from '../core/utils';
import { canvas } from './Canvas'; // Import canvas for preview

// ============================================================
// INITIALIZATION
// ============================================================
export function initSidebar() {
  // Panel Toggles
  $('#btn-settings')?.addEventListener('click', () => togglePanel('settings'));
  $('#btn-text-heading')?.addEventListener('click', () => togglePanel('text'));
  $('#btn-text-body')?.addEventListener('click', () => togglePanel('text'));
  
  // Undo/Redo
  $('#btn-undo')?.addEventListener('click', undo);
  $('#btn-redo')?.addEventListener('click', redo);
  
  // Add Slide
  $('#btn-add-slide')?.addEventListener('click', addSlide);
  
  // Device Settings
  const deviceSelector = document.getElementById('device-selector') as HTMLSelectElement;
  deviceSelector?.addEventListener('change', () => {
    state.devicePreset = deviceSelector.value;
    triggerUpdate();
  });
  
  const deviceColorSelector = document.getElementById('device-color-selector') as HTMLSelectElement;
  deviceColorSelector?.addEventListener('change', () => {
    state.deviceColor = deviceColorSelector.value;
    triggerUpdate();
  });
  
  const notchToggle = document.getElementById('notch-toggle') as HTMLInputElement;
  notchToggle?.addEventListener('change', () => {
    state.showNotch = notchToggle.checked;
    triggerUpdate();
  });
  
  // Preview
  $('#btn-preview')?.addEventListener('click', () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open();
    if (win) {
      win.document.write(`<html><head><title>Preview</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#111;}</style></head><body><img src="${dataUrl}" style="max-width:90vw;max-height:90vh;"/></body></html>`);
    }
  });
  
  // File Input
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.[0]) {
      loadScreenshot(fileInput.files[0]);
      fileInput.value = '';
    }
  });

  renderStickerGrid();
}

function loadScreenshot(file: File) {
  saveSnapshot();
  const url = URL.createObjectURL(file);
  const slide = state.slides[state.activeSlideIndex];
  
  slide.screenshotSrc = url;
  slide.showDevice = true;
  slide.layoutType = 'text-device'; // Auto switch layout if needed? Keep current behavior
  
  triggerUpdate();
}

// ============================================================
// PANEL MANAGEMENT
// ============================================================
export function openPanel(panelId: string) {
  // Close others
  $$('.panel').forEach((p) => p.classList.remove('active'));
  $$('.sidebar__btn').forEach((b) => b.classList.remove('active'));
  
  // Open this one
  state.activePanel = panelId;
  const panel = document.getElementById(`panel-${panelId}`);
  const btn = document.getElementById(`btn-${panelId}`);
  
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
  
  // If opening properties panel, ensure it renders correctly
  if (panelId === 'properties' || panelId === 'background' || panelId === 'text' || panelId === 'device' || panelId === 'stickers') {
    // Actually our previous architecture had separate panels or one panel?
    // Let's check main.ts logic. It seemed to have specific panels.
    // 'panel-text', 'panel-background', 'panel-device', 'panel-stickers'
    // 'panel-settings'
  }
}

export function togglePanel(panelId: string) {
  if (state.activePanel === panelId) {
    state.activePanel = null;
    $$('.panel').forEach((p) => p.classList.remove('active'));
    $$('.sidebar__btn').forEach((b) => b.classList.remove('active'));
  } else {
    openPanel(panelId);
  }
}


// ============================================================
// SLIDE STRIP
// ============================================================
// Drag State
let dragStartSlideIndex: number | null = null;

export function renderSlideStrip() {
  const list = $('#slide-list');
  if (!list) return;
  list.innerHTML = '';
  
  const preset = DEVICE_PRESETS[state.devicePreset];
  
  state.slides.forEach((_, index) => {
    const thumb = document.createElement('div');
    thumb.className = `slide-thumb ${index === state.activeSlideIndex ? 'active' : ''}`;
    thumb.dataset.slideIndex = index.toString();
    thumb.draggable = true; // Enable Drag
    
    // DRAG EVENTS
    thumb.addEventListener('dragstart', (e) => {
      dragStartSlideIndex = index;
      thumb.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        // Set a transparent image or just let default ghost happen
      }
    });

    thumb.addEventListener('dragend', () => {
      dragStartSlideIndex = null;
      thumb.classList.remove('dragging');
      $$('.slide-thumb').forEach(t => {
        t.classList.remove('drag-over-left', 'drag-over-right');
      });
    });

    thumb.addEventListener('dragover', (e) => {
      e.preventDefault(); // Necessary to allow dropping
      if (dragStartSlideIndex === null || dragStartSlideIndex === index) return;

      const rect = thumb.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      
      // Determine if visual feedback should be left or right
      thumb.classList.remove('drag-over-left', 'drag-over-right');
      if (e.clientX < midX) {
        thumb.classList.add('drag-over-left');
      } else {
        thumb.classList.add('drag-over-right');
      }
    });

    thumb.addEventListener('dragleave', () => {
      thumb.classList.remove('drag-over-left', 'drag-over-right');
    });

    thumb.addEventListener('drop', (e) => {
      e.preventDefault();
      thumb.classList.remove('drag-over-left', 'drag-over-right');
      
      if (dragStartSlideIndex === null || dragStartSlideIndex === index) return;
      
      const rect = thumb.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      
      let toIndex = index;
      if (e.clientX >= midX) {
        toIndex = index + 1; // Drop after
      }
      
      // Adjust because removing the item shifts indices
      if (dragStartSlideIndex < toIndex) {
        toIndex -= 1;
      }
      
      moveSlide(dragStartSlideIndex, toIndex);
    });
    
    
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 200;
    thumbCanvas.height = Math.round(200 / (preset.width / preset.height));
    thumb.appendChild(thumbCanvas);
    
    // Hover action dots
    const actions = document.createElement('div');
    actions.className = 'slide-thumb__actions';
    
    // Delete (red dot)
    if (state.slides.length > 1) {
      const delDot = document.createElement('button');
      delDot.className = 'action-dot action-dot--delete';
      delDot.innerHTML = '<span class="material-symbols-rounded">close</span>';
      delDot.title = 'Delete';
      delDot.addEventListener('click', (e) => { e.stopPropagation(); deleteSlide(index); });
      actions.appendChild(delDot);
    }
    
    // Duplicate (green dot)
    const dupDot = document.createElement('button');
    dupDot.className = 'action-dot action-dot--duplicate';
    dupDot.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
    dupDot.title = 'Duplicate';
    dupDot.addEventListener('click', (e) => { e.stopPropagation(); duplicateSlide(index); });
    actions.appendChild(dupDot);
    
    // Move left (gray dot)
    if (index > 0) {
      const leftDot = document.createElement('button');
      leftDot.className = 'action-dot action-dot--move-left';
      leftDot.innerHTML = '<span class="material-symbols-rounded">chevron_left</span>';
      leftDot.title = 'Move Left';
      leftDot.addEventListener('click', (e) => { e.stopPropagation(); moveSlide(index, index - 1); });
      actions.appendChild(leftDot);
    }
    
    // Move right (gray dot)
    if (index < state.slides.length - 1) {
      const rightDot = document.createElement('button');
      rightDot.className = 'action-dot action-dot--move-right';
      rightDot.innerHTML = '<span class="material-symbols-rounded">chevron_right</span>';
      rightDot.title = 'Move Right';
      rightDot.addEventListener('click', (e) => { e.stopPropagation(); moveSlide(index, index + 1); });
      actions.appendChild(rightDot);
    }
    
    thumb.appendChild(actions);
    
    // Click to select
    thumb.addEventListener('click', () => {
      setActiveSlide(index);
    });
    
    list.appendChild(thumb);
  });
}


// ============================================================
// STICKER GRID
// ============================================================
function renderStickerGrid() {
  const grid = $('#sticker-grid');
  if (!grid) return;
  
  grid.innerHTML = STICKER_EMOJIS.map(emoji => `
    <div class="sticker-item" data-emoji="${emoji}">${emoji}</div>
  `).join('');
  
  grid.querySelectorAll('.sticker-item').forEach(item => {
    item.addEventListener('click', () => {
      saveSnapshot();
      const slide = state.slides[state.activeSlideIndex];
      slide.stickers = slide.stickers || [];
      slide.stickers.push({
        id: uid(),
        content: (item as HTMLElement).dataset.emoji!,
        x: 500, // Center-ish
        y: 500,
        size: 100
      });
      triggerUpdate();
    });
  });
}

// ============================================================
// INLINE BACKGROUND PANEL
// ============================================================
// ============================================================
// INLINE BACKGROUND PANEL
// ============================================================
export function renderInlineBgPanel() {
  const panel = $('#bg-panel-inline');
  if (!panel) return;
  
  const slide = state.slides[state.activeSlideIndex];
  
  // TABS STATE (Simple local toggle, or just derived from slide.bgType?)
  // Let's use slide.bgType to determine which tab is active, but allow manual switching?
  // Actually, better to have explicit tabs.
  // We can inject the structure ONCE if it's not there, or just re-render.
  
  // Check if structure exists
  if (!panel.querySelector('.bg-tabs')) {
    panel.innerHTML = `
      <div class="bg-tabs">
        <button class="bg-tab" data-tab="solid">Solid</button>
        <button class="bg-tab" data-tab="gradient">Gradient</button>
        <button class="bg-tab" data-tab="image">Image</button>
      </div>
      <div class="bg-content" id="bg-content-solid" style="display:none;"></div>
      <div class="bg-content" id="bg-content-gradient" style="display:none;"></div>
      <div class="bg-content" id="bg-content-image" style="display:none;"></div>
    `;
    
    // Bind Tab Clicks
    panel.querySelectorAll('.bg-tab').forEach(t => {
      t.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.tab!;
        showBgTab(target);
      });
    });
  }
  
  // RENDER CONTENT
  // Solid
  const solidContainer = panel.querySelector('#bg-content-solid')!;
  solidContainer.innerHTML = `
    <div class="color-grid">
      ${COLOR_PRESETS.map(c => `
        <div class="color-swatch ${slide.bgType === 'solid' && slide.bgColor === c ? 'active' : ''}" 
             style="background:${c}" 
             data-color="${c}">
        </div>
      `).join('')}
    </div>
  `;
  // Bind Colors
  solidContainer.querySelectorAll('.color-swatch').forEach(el => {
    el.addEventListener('click', () => {
      state.slides[state.activeSlideIndex].bgType = 'solid';
      state.slides[state.activeSlideIndex].bgColor = (el as HTMLElement).dataset.color!;
      triggerUpdate();
    });
  });

  // Gradient
  const gradientContainer = panel.querySelector('#bg-content-gradient')!;
  gradientContainer.innerHTML = `
    <div class="gradient-presets">
      ${GRADIENT_PRESETS.map(g => `
        <div class="gradient-presets__item ${slide.bgType === 'gradient' && slide.bgGradient === g ? 'active' : ''}" 
             style="background:${g}" 
             data-gradient="${g}">
        </div>
      `).join('')}
    </div>
  `;
  // Bind Gradients
  gradientContainer.querySelectorAll('.gradient-presets__item').forEach(el => {
    el.addEventListener('click', () => {
      state.slides[state.activeSlideIndex].bgType = 'gradient';
      state.slides[state.activeSlideIndex].bgGradient = (el as HTMLElement).dataset.gradient!;
      triggerUpdate();
    });
  });

  // Image
  const imageContainer = panel.querySelector('#bg-content-image')!;
  imageContainer.innerHTML = `
    <div class="mb-4">
      <label class="btn-secondary w-full" style="display:flex;justify-content:center;align-items:center;gap:6px;cursor:pointer;padding:8px;">
        <span class="material-symbols-rounded" style="font-size:18px">upload_file</span> 
        <span>Upload Background</span>
        <input type="file" id="bg-image-upload" accept="image/*" style="display:none;" />
      </label>
    </div>

    <div class="sidebar-section__subtitle mb-2">Presets</div>
    <div class="image-grid">
      ${PRESET_BACKGROUNDS.map(img => `
        <div class="image-preset ${slide.bgType === 'image' && slide.bgImage === img ? 'active' : ''}" 
             style="background-image:url(${img})" 
             data-img="${img}">
        </div>
      `).join('')}
    </div>
    
    <div class="mt-4" style="display:${slide.bgType === 'image' ? 'flex' : 'none'};justify-content:center;">
      <button class="btn-secondary w-full" id="btn-remove-bg-image" style="display:flex;align-items:center;justify-content:center;gap:6px;">
        <span class="material-symbols-rounded" style="font-size:16px;">close</span> Remove Image
      </button>
    </div>
  `;
  
  // Bind Upload
  const fileInput = imageContainer.querySelector('#bg-image-upload') as HTMLInputElement;
  if(fileInput) {
    fileInput.addEventListener('change', () => {
      if(fileInput.files?.[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if(e.target?.result) {
            state.slides[state.activeSlideIndex].bgType = 'image';
            state.slides[state.activeSlideIndex].bgImage = e.target.result as string;
            triggerUpdate();
          }
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    });
  }

  // Bind Images
  imageContainer.querySelectorAll('.image-preset').forEach(el => {
    el.addEventListener('click', () => {
      state.slides[state.activeSlideIndex].bgType = 'image';
      state.slides[state.activeSlideIndex].bgImage = (el as HTMLElement).dataset.img!;
      triggerUpdate();
    });
  });
  // Validating Remove Button
  const removeBtn = imageContainer.querySelector('#btn-remove-bg-image') as HTMLElement;
  if(removeBtn) {
     removeBtn.onclick = () => {
        state.slides[state.activeSlideIndex].bgType = 'solid';
        state.slides[state.activeSlideIndex].bgImage = null;
        triggerUpdate();
     };
  }

  // Update Active Tab UI
  const currentType = slide.bgType === 'solid' ? 'solid' : (slide.bgType === 'gradient' ? 'gradient' : 'image');
  showBgTab(currentType);
}

function showBgTab(tabName: string) {
  const panel = $('#bg-panel-inline');
  if (!panel) return;
  
  // Update Buttons
  panel.querySelectorAll('.bg-tab').forEach(b => {
    if ((b as HTMLElement).dataset.tab === tabName) b.classList.add('active');
    else b.classList.remove('active');
  });
  
  // Update Content
  panel.querySelectorAll('.bg-content').forEach(c => {
    (c as HTMLElement).style.display = 'none';
  });
  const activeContent = panel.querySelector(`#bg-content-${tabName}`) as HTMLElement;
  if (activeContent) activeContent.style.display = 'block';
}

// ============================================================
// PROPERTIES PANEL
// ============================================================
export function updatePropertiesPanel() {
  const panel = $('#properties-panel');
  if (!panel) return;
  
  // If no panel active or slide not selected properly, maybe clear?
  if (!state.activePanel) {
    if (panel.classList.contains('active')) panel.classList.remove('active');
    return;
  }
  
  if (state.activePanel === 'text') renderTextPanel();
  else if (state.activePanel === 'background') { /* Handled by renderInlineBgPanel */ }
  else if (state.activePanel === 'device') renderDevicePanel();
  else if (state.activePanel === 'stickers') renderStickersPanel();
  else if (state.activePanel === 'settings') renderSettingsPanel();
}

function getActiveSlideData() {
  return state.slides[state.activeSlideIndex];
}

function renderTextPanel() {
  const panel = $('#properties-panel');
  if (!panel) return;
  const slide = getActiveSlideData();
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Title</div>
        <textarea id="slide-title" rows="2">${slide.title}</textarea>
        
        <div class="panel-field mt-2">
          <label>Color</label>
          <div class="color-picker-wrapper">
            <input type="color" value="${slide.titleColor}" id="title-color" />
            <span class="color-value">${slide.titleColor}</span>
          </div>
        </div>
        
        <div class="panel-field">
          <label>Size</label>
          <div class="range-row">
            <input type="range" min="20" max="200" value="${slide.titleSize}" id="title-size" />
            <span class="range-value">${slide.titleSize}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <div class="panel-section__title">Subtitle</div>
        <textarea id="slide-subtitle" rows="2">${slide.subtitle}</textarea>
        
        <div class="panel-field mt-2">
          <label>Color</label>
          <div class="color-picker-wrapper">
            <input type="color" value="${slide.subtitleColor}" id="subtitle-color" />
            <span class="color-value">${slide.subtitleColor}</span>
          </div>
        </div>
        
        <div class="panel-field">
          <label>Size</label>
          <div class="range-row">
            <input type="range" min="14" max="100" value="${slide.subtitleSize}" id="subtitle-size" />
            <span class="range-value">${slide.subtitleSize}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <div class="panel-section__title">Typography</div>
        <div class="panel-field">
          <label>Font Family</label>
          <select id="font-family">
            ${FONT_FAMILIES.map(f => `<option value="${f}" ${slide.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </div>
        
        <div class="panel-field mt-2">
          <label>Alignment</label>
          <div class="btn-group">
            <button class="icon-btn ${slide.titleAlign === 'left' ? 'active' : ''}" data-align="left">
              <span class="material-symbols-rounded">format_align_left</span>
            </button>
            <button class="icon-btn ${slide.titleAlign === 'center' ? 'active' : ''}" data-align="center">
              <span class="material-symbols-rounded">format_align_center</span>
            </button>
            <button class="icon-btn ${slide.titleAlign === 'right' ? 'active' : ''}" data-align="right">
              <span class="material-symbols-rounded">format_align_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Bind events
  const titleInput = panel.querySelector('#slide-title') as HTMLTextAreaElement;
  titleInput?.addEventListener('input', () => {
    slide.title = titleInput.value;
    triggerUpdate();
  });
  
  const subtitleInput = panel.querySelector('#slide-subtitle') as HTMLTextAreaElement;
  subtitleInput?.addEventListener('input', () => {
    slide.subtitle = subtitleInput.value;
    triggerUpdate();
  });
  
  const titleColor = panel.querySelector('#title-color') as HTMLInputElement;
  titleColor?.addEventListener('input', () => {
    slide.titleColor = titleColor.value;
    titleColor.nextElementSibling!.textContent = titleColor.value;
    triggerUpdate();
  });
  
  const subtitleColor = panel.querySelector('#subtitle-color') as HTMLInputElement;
  subtitleColor?.addEventListener('input', () => {
    slide.subtitleColor = subtitleColor.value;
    subtitleColor.nextElementSibling!.textContent = subtitleColor.value;
    triggerUpdate();
  });
  
  const titleSize = panel.querySelector('#title-size') as HTMLInputElement;
  titleSize?.addEventListener('input', () => {
    slide.titleSize = parseInt(titleSize.value);
    titleSize.nextElementSibling!.textContent = titleSize.value;
    triggerUpdate();
  });
  
  const subtitleSize = panel.querySelector('#subtitle-size') as HTMLInputElement;
  subtitleSize?.addEventListener('input', () => {
    slide.subtitleSize = parseInt(subtitleSize.value);
    subtitleSize.nextElementSibling!.textContent = subtitleSize.value;
    triggerUpdate();
  });
  
  const fontSelect = panel.querySelector('#font-family') as HTMLSelectElement;
  fontSelect?.addEventListener('change', () => {
    slide.fontFamily = fontSelect.value;
    triggerUpdate();
  });
  
  panel.querySelectorAll('[data-align]').forEach(btn => {
    btn.addEventListener('click', () => {
      slide.titleAlign = (btn as HTMLElement).dataset.align as CanvasTextAlign;
      renderTextPanel();
      triggerUpdate();
    });
  });
}

function renderDevicePanel() {
  const panel = $('#properties-panel');
  if (!panel) return;
  const slide = getActiveSlideData();
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Device Frame</div>
        <div class="toggle-row">
          <span class="toggle-row__label">Show Device</span>
          <div class="toggle ${slide.showDevice ? 'active' : ''}" id="toggle-device"></div>
        </div>
      </div>
      
      <div class="panel-section">
        <div class="panel-section__title">Position & Size</div>
        <div class="panel-field">
          <label>Vertical Position</label>
          <div class="range-row">
            <input type="range" min="0" max="60" value="${slide.deviceOffsetY}" id="device-pos-y" />
            <span class="range-value">${slide.deviceOffsetY}%</span>
          </div>
        </div>
        <div class="panel-field">
          <label>Scale</label>
          <div class="range-row">
            <input type="range" min="30" max="100" value="${slide.deviceScale}" id="device-scale-ctrl" />
            <span class="range-value">${slide.deviceScale}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  panel.querySelector('#toggle-device')?.addEventListener('click', (e) => {
    slide.showDevice = !slide.showDevice;
    (e.currentTarget as HTMLElement).classList.toggle('active');
    triggerUpdate();
  });
  
  const posY = panel.querySelector('#device-pos-y') as HTMLInputElement;
  posY?.addEventListener('input', () => {
    slide.deviceOffsetY = parseInt(posY.value);
    posY.nextElementSibling!.textContent = posY.value + '%';
    triggerUpdate();
  });
  
  const scaleCtrl = panel.querySelector('#device-scale-ctrl') as HTMLInputElement;
  scaleCtrl?.addEventListener('input', () => {
    slide.deviceScale = parseInt(scaleCtrl.value);
    scaleCtrl.nextElementSibling!.textContent = scaleCtrl.value + '%';
    triggerUpdate();
  });
}

function renderStickersPanel() {
  const panel = $('#properties-panel');
  if (!panel) return;
  const slide = getActiveSlideData();
  
  let stickersHtml = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Add Sticker</div>
        <div class="sticker-grid">
          ${STICKER_EMOJIS.map(emoji => `
            <div class="sticker-item" data-emoji="${emoji}">${emoji}</div>
          `).join('')}
        </div>
      </div>
  `;
  
  if (state.selectedStickerId) {
    const sticker = slide.stickers?.find(s => s.id === state.selectedStickerId);
    if (sticker) {
      stickersHtml += `
        <div class="panel-section">
          <div class="panel-section__title">Selected Sticker</div>
          <div class="panel-field">
            <label>Size</label>
            <div class="range-row">
              <input type="range" min="20" max="300" value="${sticker.size}" id="sticker-size" />
              <span class="range-value">${sticker.size}px</span>
            </div>
          </div>
          <button class="btn-danger w-full mt-4" id="delete-sticker">Delete Sticker</button>
        </div>
      `;
    }
  }
  
  stickersHtml += '</div>';
  panel.innerHTML = stickersHtml;
  
  panel.querySelectorAll('.sticker-item').forEach(item => {
    item.addEventListener('click', () => {
      saveSnapshot();
      slide.stickers = slide.stickers || [];
      slide.stickers.push({
        id: uid(),
        content: (item as HTMLElement).dataset.emoji!,
        x: 500, // Center-ish
        y: 500,
        size: 100
      });
      triggerUpdate();
    });
  });
  
  if (state.selectedStickerId) {
    const slider = panel.querySelector('#sticker-size') as HTMLInputElement;
    slider?.addEventListener('input', () => {
      const sticker = slide.stickers?.find(s => s.id === state.selectedStickerId);
      if (sticker) {
        sticker.size = parseInt(slider.value);
        slider.nextElementSibling!.textContent = sticker.size + 'px';
        triggerUpdate();
      }
    });
    
    panel.querySelector('#delete-sticker')?.addEventListener('click', () => {
      saveSnapshot();
      slide.stickers = slide.stickers.filter(s => s.id !== state.selectedStickerId);
      state.selectedStickerId = null;
      renderStickersPanel();
      triggerUpdate();
    });
  }
}

function renderSettingsPanel() {
  const panel = $('#properties-panel');
  if (!panel) return;
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Output Size</div>
        <div class="panel-field">
          <label>Device Preset</label>
          <select id="settings-device-preset">
            ${Object.entries(DEVICE_PRESETS).map(([key, val]) => `
              <option value="${key}" ${state.devicePreset === key ? 'selected' : ''}>${val.label} (${val.width}×${val.height})</option>
            `).join('')}
          </select>
        </div>
      </div>
      
      <div class="panel-section">
        <div class="panel-section__title">Project</div>
        <div class="panel-field">
          <label>Total Slides</label>
          <div class="text-muted text-sm">${state.slides.length} screenshot(s)</div>
        </div>
      </div>
      
      <div class="panel-section">
        <div class="panel-section__title">Keyboard Shortcuts</div>
        <div class="keyboard-shortcut-list">
          <div class="keyboard-shortcut-item"><kbd>⌘/Ctrl + Z</kbd><span>Undo</span></div>
          <div class="keyboard-shortcut-item"><kbd>⌘/Ctrl + Shift + Z</kbd><span>Redo</span></div>
          <div class="keyboard-shortcut-item"><kbd>⌘/Ctrl + S</kbd><span>Export</span></div>
        </div>
      </div>
    </div>
  `;
  
  const presetSelect = panel.querySelector('#settings-device-preset') as HTMLSelectElement;
  presetSelect?.addEventListener('change', () => {
    state.devicePreset = presetSelect.value;
    (document.getElementById('device-selector') as HTMLSelectElement).value = state.devicePreset;
    triggerUpdate();
  });
}
