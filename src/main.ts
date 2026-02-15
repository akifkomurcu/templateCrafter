import './style.css';

// ============================================================
// TYPES & INTERFACES
// ============================================================
interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  titleSize: number;
  subtitleSize: number;
  titleAlign: CanvasTextAlign;
  bgType: 'solid' | 'gradient';
  bgColor: string;
  bgGradient: string;
  screenshotSrc: string | null;
  layoutType: 'blank' | 'device-only' | 'text-device' | 'text-only';
  showDevice: boolean;
  deviceOffsetY: number;
  deviceScale: number;
  fontFamily: string;
}

interface DevicePreset {
  label: string;
  width: number;
  height: number;
  category: string;
}

interface AppState {
  slides: SlideData[];
  activeSlideIndex: number;
  devicePreset: string;
  activePanel: string | null;
  deviceColor: string;
  showNotch: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================
const DEVICE_PRESETS: Record<string, DevicePreset> = {
  'iphone-6.7': { label: 'iPhone 6.7"', width: 1290, height: 2796, category: 'iphone' },
  'iphone-6.5': { label: 'iPhone 6.5"', width: 1284, height: 2778, category: 'iphone' },
  'iphone-6.1': { label: 'iPhone 6.1"', width: 1179, height: 2556, category: 'iphone' },
  'iphone-5.5': { label: 'iPhone 5.5"', width: 1242, height: 2208, category: 'iphone' },
  'ipad-12.9': { label: 'iPad 12.9"', width: 2048, height: 2732, category: 'ipad' },
  'ipad-11': { label: 'iPad 11"', width: 1668, height: 2388, category: 'ipad' },
  'android-16:9': { label: 'Android 16:9', width: 1080, height: 1920, category: 'android' },
  'android-9:16': { label: 'Android 9:16', width: 1080, height: 1920, category: 'android' },
};

const COLOR_PRESETS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483', '#7c5cfc',
  '#e94560', '#ff6b6b', '#ffa502', '#2ed573', '#1dd1a1',
  '#38bdf8', '#818cf8', '#f472b6', '#fb923c', '#a78bfa',
  '#000000', '#1e1e1e', '#2d2d2d', '#ffffff', '#f8fafc',
];

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(180deg, #000428 0%, #004e92 100%)',
  'linear-gradient(180deg, #200122 0%, #6f0000 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
];

const FONT_FAMILIES = [
  'Inter',
  'Arial',
  'Helvetica Neue',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
];

const TEMPLATE_COLORS = [
  '#7c5cfc', '#e94560', '#38bdf8', '#2ed573', '#ffa502',
  '#f472b6', '#818cf8', '#fb923c', '#1dd1a1', '#a78bfa',
  '#533483', '#0f3460', '#16213e', '#1a1a2e',
];

const STICKER_EMOJIS = [
  '⭐', '🔥', '✨', '💎', '🚀', '❤️',
  '🎯', '👑', '⚡', '🌟', '🎨', '💡',
  '🏆', '🎉', '🔔',
];

// ============================================================
// HELPER: Generate unique ID
// ============================================================
function uid(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ============================================================
// DEFAULT SLIDE
// ============================================================
function createDefaultSlide(): SlideData {
  return {
    id: uid(),
    title: 'Your Amazing App',
    subtitle: 'Subtitle goes here',
    titleColor: '#ffffff',
    subtitleColor: '#ccccdd',
    titleSize: 64,
    subtitleSize: 36,
    titleAlign: 'center',
    bgType: 'gradient',
    bgColor: '#1a1a2e',
    bgGradient: GRADIENT_PRESETS[0],
    screenshotSrc: null,
    layoutType: 'text-device',
    showDevice: true,
    deviceOffsetY: 15,
    deviceScale: 75,
    fontFamily: 'Inter',
  };
}

// ============================================================
// APP STATE
// ============================================================
const state: AppState = {
  slides: [createDefaultSlide()],
  activeSlideIndex: 0,
  devicePreset: 'iphone-6.7',
  activePanel: null,
  deviceColor: 'black',
  showNotch: true,
};

// Keep screenshot images cached
const screenshotCache = new Map<string, HTMLImageElement>();

// ============================================================
// DOM REFERENCES
// ============================================================
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// ============================================================
// CANVAS RENDERING
// ============================================================
function getActiveSlide(): SlideData {
  return state.slides[state.activeSlideIndex];
}

function getPreset(): DevicePreset {
  return DEVICE_PRESETS[state.devicePreset];
}

function renderCanvas() {
  const slide = getActiveSlide();
  if (!slide) return;
  const preset = getPreset();
  
  // Set canvas size (scaled for display)
  const maxDisplayW = ($('.canvas-area')?.clientWidth || 800) - 80;
  const maxDisplayH = ($('.canvas-area')?.clientHeight || 600) - 80;
  
  const aspectRatio = preset.width / preset.height;
  let displayW: number, displayH: number;
  
  if (maxDisplayW / maxDisplayH > aspectRatio) {
    displayH = maxDisplayH;
    displayW = displayH * aspectRatio;
  } else {
    displayW = maxDisplayW;
    displayH = displayW / aspectRatio;
  }

  canvas.style.width = displayW + 'px';
  canvas.style.height = displayH + 'px';
  canvas.width = preset.width;
  canvas.height = preset.height;
  
  // Clear
  ctx.clearRect(0, 0, preset.width, preset.height);
  
  // Draw background
  drawBackground(slide, preset);
  
  // Draw text
  if (slide.layoutType !== 'blank' && slide.layoutType !== 'device-only') {
    drawText(slide, preset);
  }
  
  // Draw device frame + screenshot
  if (slide.showDevice && slide.layoutType !== 'blank' && slide.layoutType !== 'text-only') {
    drawDeviceFrame(slide, preset);
  }
  
  // Update thumbnail
  updateThumbnail(state.activeSlideIndex);
}

function drawBackground(slide: SlideData, preset: DevicePreset) {
  if (slide.bgType === 'gradient') {
    // Parse gradient string to create canvas gradient
    const gradientColors = parseGradientColors(slide.bgGradient);
    const angle = parseGradientAngle(slide.bgGradient);
    const radians = (angle - 90) * Math.PI / 180;
    
    const cx = preset.width / 2;
    const cy = preset.height / 2;
    const len = Math.max(preset.width, preset.height);
    
    const x1 = cx - Math.cos(radians) * len / 2;
    const y1 = cy - Math.sin(radians) * len / 2;
    const x2 = cx + Math.cos(radians) * len / 2;
    const y2 = cy + Math.sin(radians) * len / 2;
    
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradientColors.forEach((stop) => {
      gradient.addColorStop(stop.pos, stop.color);
    });
    
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = slide.bgColor;
  }
  ctx.fillRect(0, 0, preset.width, preset.height);
}

function parseGradientColors(gradientStr: string): Array<{color: string, pos: number}> {
  const colorRegex = /(#[0-9a-fA-F]{6}|rgba?\([^)]+\))\s+(\d+)%/g;
  const stops: Array<{color: string, pos: number}> = [];
  let match;
  while ((match = colorRegex.exec(gradientStr)) !== null) {
    stops.push({ color: match[1], pos: parseInt(match[2]) / 100 });
  }
  if (stops.length === 0) {
    stops.push({ color: '#667eea', pos: 0 }, { color: '#764ba2', pos: 1 });
  }
  return stops;
}

function parseGradientAngle(gradientStr: string): number {
  const angleMatch = gradientStr.match(/(\d+)deg/);
  if (angleMatch) return parseInt(angleMatch[1]);
  if (gradientStr.includes('to bottom')) return 180;
  if (gradientStr.includes('to right')) return 90;
  return 135;
}

function drawText(slide: SlideData, preset: DevicePreset) {
  const titleY = preset.height * 0.08;
  const subtitleY = titleY + slide.titleSize * 1.4;
  
  // Title
  ctx.textAlign = slide.titleAlign;
  ctx.textBaseline = 'top';
  
  const titleX = slide.titleAlign === 'center' ? preset.width / 2 :
                  slide.titleAlign === 'left' ? preset.width * 0.08 :
                  preset.width * 0.92;
  
  ctx.font = `800 ${slide.titleSize}px "${slide.fontFamily}", sans-serif`;
  ctx.fillStyle = slide.titleColor;
  
  // Word wrap title
  wrapText(ctx, slide.title, titleX, titleY, preset.width * 0.84, slide.titleSize * 1.2);
  
  // Subtitle
  const titleLines = getWrappedLines(ctx, slide.title, preset.width * 0.84);
  const actualSubtitleY = titleY + titleLines.length * slide.titleSize * 1.2 + 20;
  
  ctx.font = `400 ${slide.subtitleSize}px "${slide.fontFamily}", sans-serif`;
  ctx.fillStyle = slide.subtitleColor;
  wrapText(ctx, slide.subtitle, titleX, actualSubtitleY, preset.width * 0.84, slide.subtitleSize * 1.3);
}

function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = getWrappedLines(ctx, text, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
}

function drawDeviceFrame(slide: SlideData, preset: DevicePreset) {
  const category = DEVICE_PRESETS[state.devicePreset].category;
  
  // Device frame dimensions relative to canvas
  const deviceW = preset.width * (slide.deviceScale / 100);
  const deviceH = deviceW * (category === 'ipad' ? 1.35 : 2.05);
  const deviceX = (preset.width - deviceW) / 2;
  const deviceY = preset.height * (slide.deviceOffsetY / 100);
  
  // Frame border radius
  const radius = deviceW * 0.08;
  const bezelW = deviceW * 0.025;
  
  // Draw frame shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  
  // Draw outer frame (dark bezel)
  const frameColors: Record<string, string> = {
    black: '#1a1a1a',
    silver: '#c0c0c0',
    gold: '#d4af37',
  };
  ctx.fillStyle = frameColors[state.deviceColor] || '#1a1a1a';
  roundRect(ctx, deviceX, deviceY, deviceW, deviceH, radius);
  ctx.fill();
  ctx.restore();
  
  // Draw screen area
  const screenX = deviceX + bezelW;
  const screenY = deviceY + bezelW;
  const screenW = deviceW - bezelW * 2;
  const screenH = deviceH - bezelW * 2;
  const screenRadius = radius * 0.85;
  
  // If screenshot exists, draw it
  if (slide.screenshotSrc && screenshotCache.has(slide.screenshotSrc)) {
    const img = screenshotCache.get(slide.screenshotSrc)!;
    
    ctx.save();
    roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
    ctx.clip();
    
    // Cover fit
    const imgAspect = img.width / img.height;
    const screenAspect = screenW / screenH;
    let drawW: number, drawH: number, drawX: number, drawY: number;
    
    if (imgAspect > screenAspect) {
      drawH = screenH;
      drawW = drawH * imgAspect;
      drawX = screenX - (drawW - screenW) / 2;
      drawY = screenY;
    } else {
      drawW = screenW;
      drawH = drawW / imgAspect;
      drawX = screenX;
      drawY = screenY - (drawH - screenH) / 2;
    }
    
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    // Empty screen
    ctx.fillStyle = '#2a2a3e';
    roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
    ctx.fill();
    
    // Placeholder icon
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${screenW * 0.15}px "Material Symbols Rounded"`;
    ctx.fillText('image', screenX + screenW / 2, screenY + screenH / 2);
  }
  
  // Draw notch/dynamic island (iPhone) — only if enabled
  if (category === 'iphone' && state.showNotch) {
    const notchW = deviceW * 0.3;
    const notchH = deviceW * 0.065;
    const notchX = deviceX + (deviceW - notchW) / 2;
    const notchY = deviceY + bezelW + 12;
    
    ctx.fillStyle = '#1a1a1a';
    roundRect(ctx, notchX, notchY, notchW, notchH, notchH / 2);
    ctx.fill();
  }
  
  // Draw home indicator
  const indicatorW = deviceW * 0.35;
  const indicatorH = 5;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  roundRect(ctx, deviceX + (deviceW - indicatorW) / 2, deviceY + deviceH - bezelW - 20, indicatorW, indicatorH, indicatorH / 2);
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================
// THUMBNAIL RENDERING
// ============================================================
function updateThumbnail(index: number) {
  const thumbCanvas = document.querySelector(`[data-slide-index="${index}"] canvas`) as HTMLCanvasElement;
  if (!thumbCanvas) return;
  
  const thumbCtx = thumbCanvas.getContext('2d')!;
  const scale = thumbCanvas.width / canvas.width;
  
  thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
  thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
}

// ============================================================
// SLIDE STRIP (HORIZONTAL)
// ============================================================
function renderSlideStrip() {
  const list = $('#slide-list');
  list.innerHTML = '';
  
  state.slides.forEach((slide, index) => {
    const thumb = document.createElement('div');
    thumb.className = `slide-thumb ${index === state.activeSlideIndex ? 'active' : ''}`;
    thumb.dataset.slideIndex = index.toString();
    
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 200;
    thumbCanvas.height = Math.round(200 / (getPreset().width / getPreset().height));
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
    
    // Number badge
    const numBadge = document.createElement('span');
    numBadge.className = 'slide-thumb__number';
    numBadge.textContent = (index + 1).toString();
    thumb.appendChild(numBadge);
    
    // Click to select
    thumb.addEventListener('click', () => {
      state.activeSlideIndex = index;
      renderSlideStrip();
      renderCanvas();
      if (state.activePanel) openPanel(state.activePanel);
    });
    
    list.appendChild(thumb);
  });
  
  // Render all thumbnails
  const savedIndex = state.activeSlideIndex;
  state.slides.forEach((_, i) => {
    state.activeSlideIndex = i;
    renderCanvas();
  });
  state.activeSlideIndex = savedIndex;
  renderCanvas();
}

function addSlide() {
  state.slides.push(createDefaultSlide());
  state.activeSlideIndex = state.slides.length - 1;
  renderSlideStrip();
  renderCanvas();
}

function deleteSlide(index: number) {
  if (state.slides.length <= 1) return;
  state.slides.splice(index, 1);
  if (state.activeSlideIndex >= state.slides.length) {
    state.activeSlideIndex = state.slides.length - 1;
  }
  renderSlideStrip();
  renderCanvas();
}

function duplicateSlide(index: number) {
  const copy = { ...state.slides[index], id: uid() };
  state.slides.splice(index + 1, 0, copy);
  state.activeSlideIndex = index + 1;
  renderSlideStrip();
  renderCanvas();
}

function moveSlide(from: number, to: number) {
  if (to < 0 || to >= state.slides.length) return;
  const [item] = state.slides.splice(from, 1);
  state.slides.splice(to, 0, item);
  state.activeSlideIndex = to;
  renderSlideStrip();
  renderCanvas();
}

// ============================================================
// PROPERTIES PANEL
// ============================================================
function openPanel(panelType: string) {
  state.activePanel = panelType;
  const panel = $('#properties-panel');
  panel.classList.add('open');
  
  // Update active toolbar buttons
  document.querySelectorAll('.topbar__btn.icon-btn').forEach(btn => btn.classList.remove('active'));
  const btnMap: Record<string, string> = {
    background: '#btn-background',
    text: '#btn-text',
    images: '#btn-images',
    device: '#btn-device',
    settings: '#btn-settings',
    'global-styles': '#btn-global-styles',
  };
  if (btnMap[panelType]) {
    $(btnMap[panelType])?.classList.add('active');
  }
  
  switch (panelType) {
    case 'background': renderBackgroundPanel(); break;
    case 'text': renderTextPanel(); break;
    case 'images': renderImagesPanel(); break;
    case 'device': renderDevicePanel(); break;
    case 'settings': renderSettingsPanel(); break;
    case 'global-styles': renderGlobalStylesPanel(); break;
  }
}

function closePanel() {
  state.activePanel = null;
  const panel = $('#properties-panel');
  panel.classList.remove('open');
  document.querySelectorAll('.topbar__btn.icon-btn').forEach(btn => btn.classList.remove('active'));
}

function togglePanel(panelType: string) {
  if (state.activePanel === panelType) {
    closePanel();
  } else {
    openPanel(panelType);
  }
}

// ============================================================
// BACKGROUND PANEL
// ============================================================
function renderBackgroundPanel() {
  const panel = $('#properties-panel');
  const slide = getActiveSlide();
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Background Type</div>
        <div class="tabs">
          <button class="tab-btn ${slide.bgType === 'solid' ? 'active' : ''}" data-bg-type="solid">Solid Color</button>
          <button class="tab-btn ${slide.bgType === 'gradient' ? 'active' : ''}" data-bg-type="gradient">Gradient</button>
        </div>
        
        ${slide.bgType === 'solid' ? `
          <div class="panel-field">
            <label>Color</label>
            <div class="color-picker-row">
              <input type="color" class="color-swatch" value="${slide.bgColor}" id="bg-color-swatch" />
              <input type="text" class="color-input-hex" value="${slide.bgColor}" id="bg-color-hex" />
            </div>
          </div>
          <div class="color-presets" id="bg-color-presets">
            ${COLOR_PRESETS.map(c => `
              <div class="color-presets__item ${slide.bgColor === c ? 'active' : ''}" 
                   style="background:${c}" data-color="${c}"></div>
            `).join('')}
          </div>
        ` : `
          <div class="gradient-presets" id="bg-gradient-presets">
            ${GRADIENT_PRESETS.map((g, i) => `
              <div class="gradient-presets__item ${slide.bgGradient === g ? 'active' : ''}" 
                   style="background:${g}" data-gradient-index="${i}"></div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  
  // Events
  panel.querySelectorAll('[data-bg-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      slide.bgType = (btn as HTMLElement).dataset.bgType as 'solid' | 'gradient';
      renderBackgroundPanel();
      renderCanvas();
      updateThumbnail(state.activeSlideIndex);
    });
  });
  
  const colorSwatch = panel.querySelector('#bg-color-swatch') as HTMLInputElement;
  const colorHex = panel.querySelector('#bg-color-hex') as HTMLInputElement;
  
  if (colorSwatch) {
    colorSwatch.addEventListener('input', (e) => {
      slide.bgColor = (e.target as HTMLInputElement).value;
      if (colorHex) colorHex.value = slide.bgColor;
      renderCanvas();
    });
  }
  
  if (colorHex) {
    colorHex.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        slide.bgColor = val;
        if (colorSwatch) colorSwatch.value = slide.bgColor;
        renderCanvas();
      }
    });
  }
  
  panel.querySelectorAll('[data-color]').forEach(item => {
    item.addEventListener('click', () => {
      slide.bgColor = (item as HTMLElement).dataset.color!;
      slide.bgType = 'solid';
      renderBackgroundPanel();
      renderCanvas();
    });
  });
  
  panel.querySelectorAll('[data-gradient-index]').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt((item as HTMLElement).dataset.gradientIndex!);
      slide.bgGradient = GRADIENT_PRESETS[idx];
      slide.bgType = 'gradient';
      renderBackgroundPanel();
      renderCanvas();
    });
  });
}

// ============================================================
// TEXT PANEL
// ============================================================
function renderTextPanel() {
  const panel = $('#properties-panel');
  const slide = getActiveSlide();
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Title</div>
        <div class="panel-field">
          <textarea id="text-title" rows="2">${slide.title}</textarea>
        </div>
        <div class="panel-field">
          <label>Color</label>
          <div class="color-picker-row">
            <input type="color" class="color-swatch" value="${slide.titleColor}" id="title-color" />
            <input type="text" class="color-input-hex" value="${slide.titleColor}" id="title-color-hex" />
          </div>
        </div>
        <div class="panel-field">
          <label>Size (${slide.titleSize}px)</label>
          <div class="range-row">
            <input type="range" min="24" max="120" value="${slide.titleSize}" id="title-size" />
            <span class="range-value">${slide.titleSize}</span>
          </div>
        </div>
        <div class="panel-field">
          <label>Alignment</label>
          <div class="align-group">
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
      
      <div class="panel-section">
        <div class="panel-section__title">Subtitle</div>
        <div class="panel-field">
          <textarea id="text-subtitle" rows="2">${slide.subtitle}</textarea>
        </div>
        <div class="panel-field">
          <label>Color</label>
          <div class="color-picker-row">
            <input type="color" class="color-swatch" value="${slide.subtitleColor}" id="subtitle-color" />
            <input type="text" class="color-input-hex" value="${slide.subtitleColor}" id="subtitle-color-hex" />
          </div>
        </div>
        <div class="panel-field">
          <label>Size (${slide.subtitleSize}px)</label>
          <div class="range-row">
            <input type="range" min="16" max="72" value="${slide.subtitleSize}" id="subtitle-size" />
            <span class="range-value">${slide.subtitleSize}</span>
          </div>
        </div>
      </div>
      
      <div class="panel-section">
        <div class="panel-section__title">Font</div>
        <div class="panel-field">
          <select id="font-family" class="w-full" style="padding:8px 12px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--radius-sm);color:var(--c-text);font-family:var(--font-sans);font-size:var(--fs-sm);">
            ${FONT_FAMILIES.map(f => `
              <option value="${f}" ${slide.fontFamily === f ? 'selected' : ''} style="font-family:'${f}'">${f}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>
  `;
  
  // Text inputs
  const titleInput = panel.querySelector('#text-title') as HTMLTextAreaElement;
  titleInput?.addEventListener('input', () => {
    slide.title = titleInput.value;
    renderCanvas();
  });
  
  const subtitleInput = panel.querySelector('#text-subtitle') as HTMLTextAreaElement;
  subtitleInput?.addEventListener('input', () => {
    slide.subtitle = subtitleInput.value;
    renderCanvas();
  });
  
  // Title color
  const titleColor = panel.querySelector('#title-color') as HTMLInputElement;
  const titleColorHex = panel.querySelector('#title-color-hex') as HTMLInputElement;
  titleColor?.addEventListener('input', () => {
    slide.titleColor = titleColor.value;
    titleColorHex.value = titleColor.value;
    renderCanvas();
  });
  titleColorHex?.addEventListener('change', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(titleColorHex.value)) {
      slide.titleColor = titleColorHex.value;
      titleColor.value = titleColorHex.value;
      renderCanvas();
    }
  });
  
  // Subtitle color
  const subtitleColor = panel.querySelector('#subtitle-color') as HTMLInputElement;
  const subtitleColorHex = panel.querySelector('#subtitle-color-hex') as HTMLInputElement;
  subtitleColor?.addEventListener('input', () => {
    slide.subtitleColor = subtitleColor.value;
    subtitleColorHex.value = subtitleColor.value;
    renderCanvas();
  });
  subtitleColorHex?.addEventListener('change', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(subtitleColorHex.value)) {
      slide.subtitleColor = subtitleColorHex.value;
      subtitleColor.value = subtitleColorHex.value;
      renderCanvas();
    }
  });
  
  // Title size
  const titleSize = panel.querySelector('#title-size') as HTMLInputElement;
  titleSize?.addEventListener('input', () => {
    slide.titleSize = parseInt(titleSize.value);
    const valueSpan = titleSize.nextElementSibling as HTMLElement;
    if (valueSpan) valueSpan.textContent = titleSize.value;
    renderCanvas();
  });
  
  // Subtitle size
  const subtitleSize = panel.querySelector('#subtitle-size') as HTMLInputElement;
  subtitleSize?.addEventListener('input', () => {
    slide.subtitleSize = parseInt(subtitleSize.value);
    const valueSpan = subtitleSize.nextElementSibling as HTMLElement;
    if (valueSpan) valueSpan.textContent = subtitleSize.value;
    renderCanvas();
  });
  
  // Alignment
  panel.querySelectorAll('[data-align]').forEach(btn => {
    btn.addEventListener('click', () => {
      slide.titleAlign = (btn as HTMLElement).dataset.align as CanvasTextAlign;
      renderTextPanel();
      renderCanvas();
    });
  });
  
  // Font family
  const fontSelect = panel.querySelector('#font-family') as HTMLSelectElement;
  fontSelect?.addEventListener('change', () => {
    slide.fontFamily = fontSelect.value;
    renderCanvas();
  });
}

// ============================================================
// IMAGES PANEL
// ============================================================
function renderImagesPanel() {
  const panel = $('#properties-panel');
  const slide = getActiveSlide();
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Screenshot</div>
        <div class="drop-zone" id="screenshot-drop-zone">
          ${slide.screenshotSrc ? `
            <img src="${slide.screenshotSrc}" style="max-width:100%;max-height:200px;border-radius:var(--radius-sm);" />
            <button class="icon-btn" id="remove-screenshot" style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.7);">
              <span class="material-symbols-rounded">close</span>
            </button>
          ` : `
            <span class="material-symbols-rounded">cloud_upload</span>
            <span class="drop-zone__label">Drop screenshot here</span>
            <span class="drop-zone__hint">or click to browse • PNG, JPG</span>
          `}
        </div>
      </div>
      
      ${slide.screenshotSrc ? `
      <div class="panel-section">
        <div class="panel-section__title">Device Position</div>
        <div class="panel-field">
          <label>Vertical Offset</label>
          <div class="range-row">
            <input type="range" min="0" max="60" value="${slide.deviceOffsetY}" id="device-offset-y" />
            <span class="range-value">${slide.deviceOffsetY}%</span>
          </div>
        </div>
        <div class="panel-field">
          <label>Scale</label>
          <div class="range-row">
            <input type="range" min="30" max="100" value="${slide.deviceScale}" id="device-scale" />
            <span class="range-value">${slide.deviceScale}%</span>
          </div>
        </div>
      </div>
      ` : ''}
    </div>
  `;
  
  // Drop zone
  const dropZone = panel.querySelector('#screenshot-drop-zone') as HTMLElement;
  
  dropZone?.addEventListener('click', () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.click();
  });
  
  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  
  dropZone?.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });
  
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = (e as DragEvent).dataTransfer?.files;
    if (files?.[0]) loadScreenshot(files[0]);
  });
  
  // Remove screenshot
  panel.querySelector('#remove-screenshot')?.addEventListener('click', (e) => {
    e.stopPropagation();
    slide.screenshotSrc = null;
    renderImagesPanel();
    renderCanvas();
  });
  
  // Device sliders
  const offsetY = panel.querySelector('#device-offset-y') as HTMLInputElement;
  offsetY?.addEventListener('input', () => {
    slide.deviceOffsetY = parseInt(offsetY.value);
    const span = offsetY.nextElementSibling as HTMLElement;
    if (span) span.textContent = offsetY.value + '%';
    renderCanvas();
  });
  
  const scale = panel.querySelector('#device-scale') as HTMLInputElement;
  scale?.addEventListener('input', () => {
    slide.deviceScale = parseInt(scale.value);
    const span = scale.nextElementSibling as HTMLElement;
    if (span) span.textContent = scale.value + '%';
    renderCanvas();
  });
}

function loadScreenshot(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target?.result as string;
    const img = new Image();
    img.onload = () => {
      screenshotCache.set(src, img);
      getActiveSlide().screenshotSrc = src;
      renderImagesPanel();
      renderCanvas();
    };
    img.src = src;
  };
  reader.readAsDataURL(file);
}

// ============================================================
// DEVICE PANEL
// ============================================================
function renderDevicePanel() {
  const panel = $('#properties-panel');
  const slide = getActiveSlide();
  
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
  
  // Toggle
  panel.querySelector('#toggle-device')?.addEventListener('click', (e) => {
    slide.showDevice = !slide.showDevice;
    (e.currentTarget as HTMLElement).classList.toggle('active');
    renderCanvas();
  });
  
  // Sliders
  const posY = panel.querySelector('#device-pos-y') as HTMLInputElement;
  posY?.addEventListener('input', () => {
    slide.deviceOffsetY = parseInt(posY.value);
    const span = posY.nextElementSibling as HTMLElement;
    if (span) span.textContent = posY.value + '%';
    renderCanvas();
  });
  
  const scaleCtrl = panel.querySelector('#device-scale-ctrl') as HTMLInputElement;
  scaleCtrl?.addEventListener('input', () => {
    slide.deviceScale = parseInt(scaleCtrl.value);
    const span = scaleCtrl.nextElementSibling as HTMLElement;
    if (span) span.textContent = scaleCtrl.value + '%';
    renderCanvas();
  });
}

// ============================================================
// SETTINGS PANEL
// ============================================================
function renderSettingsPanel() {
  const panel = $('#properties-panel');
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Output Size</div>
        <div class="panel-field">
          <label>Device Preset</label>
          <select id="settings-device-preset" style="width:100%;padding:8px 12px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--radius-sm);color:var(--c-text);font-family:var(--font-sans);font-size:var(--fs-sm);">
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
        <div style="font-size:var(--fs-xs);color:var(--c-text-muted);line-height:2;">
          <div><kbd style="background:var(--c-surface);padding:2px 6px;border-radius:4px;">⌘/Ctrl + S</kbd> — Export All</div>
          <div><kbd style="background:var(--c-surface);padding:2px 6px;border-radius:4px;">⌘/Ctrl + D</kbd> — Duplicate Slide</div>
          <div><kbd style="background:var(--c-surface);padding:2px 6px;border-radius:4px;">Delete</kbd> — Delete Slide</div>
          <div><kbd style="background:var(--c-surface);padding:2px 6px;border-radius:4px;">←/→</kbd> — Navigate Slides</div>
        </div>
      </div>
    </div>
  `;
  
  const presetSelect = panel.querySelector('#settings-device-preset') as HTMLSelectElement;
  presetSelect?.addEventListener('change', () => {
    state.devicePreset = presetSelect.value;
    (document.getElementById('device-selector') as HTMLSelectElement).value = state.devicePreset;
    renderSlideStrip();
    renderCanvas();
  });
}

// ============================================================
// GLOBAL STYLES PANEL
// ============================================================
function renderGlobalStylesPanel() {
  const panel = $('#properties-panel');
  
  panel.innerHTML = `
    <div class="properties-panel__content">
      <div class="panel-section">
        <div class="panel-section__title">Apply to All Slides</div>
        
        <div class="panel-field">
          <label>Background</label>
          <div class="gradient-presets" id="global-bg-presets">
            ${GRADIENT_PRESETS.map((g, i) => `
              <div class="gradient-presets__item" style="background:${g}" data-gradient-index="${i}"></div>
            `).join('')}
          </div>
        </div>
        
        <div class="panel-field mt-4">
          <label>Font Family</label>
          <select id="global-font" style="width:100%;padding:8px 12px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--radius-sm);color:var(--c-text);font-family:var(--font-sans);font-size:var(--fs-sm);">
            ${FONT_FAMILIES.map(f => `<option value="${f}">${f}</option>`).join('')}
          </select>
        </div>
        
        <button class="btn-primary w-full mt-4" id="apply-global-font" style="justify-content:center;">
          Apply Font to All
        </button>
      </div>
    </div>
  `;
  
  // Apply gradient to all
  panel.querySelectorAll('[data-gradient-index]').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt((item as HTMLElement).dataset.gradientIndex!);
      state.slides.forEach(s => {
        s.bgGradient = GRADIENT_PRESETS[idx];
        s.bgType = 'gradient';
      });
      renderSlideStrip();
      renderCanvas();
    });
  });
  
  // Apply font to all
  panel.querySelector('#apply-global-font')?.addEventListener('click', () => {
    const fontSelect = panel.querySelector('#global-font') as HTMLSelectElement;
    state.slides.forEach(s => {
      s.fontFamily = fontSelect.value;
    });
    renderSlideStrip();
    renderCanvas();
  });
}

// ============================================================
// LAYOUT SELECTOR MODAL
// ============================================================
function openLayoutModal() {
  const overlay = $('#modal-overlay');
  const title = $('#modal-title');
  const body = $('#modal-body');
  
  title.textContent = 'Layout Selector';
  body.innerHTML = `
    <div class="layout-grid">
      <div class="layout-card" data-layout="blank">
        <span class="layout-card__label">Blank</span>
      </div>
      <div class="layout-card" data-layout="text-device">
        <div class="layout-card__text-line"></div>
        <div class="layout-card__text-line short"></div>
        <div class="layout-card__device-placeholder" style="margin-top:auto;"></div>
        <span class="layout-card__label">Text + Device</span>
      </div>
      <div class="layout-card" data-layout="device-only">
        <div class="layout-card__device-placeholder" style="height:80%;width:50%;"></div>
        <span class="layout-card__label">Device Only</span>
      </div>
      <div class="layout-card" data-layout="text-only">
        <div class="layout-card__text-line" style="margin-top:30%;"></div>
        <div class="layout-card__text-line short"></div>
        <div class="layout-card__text-line" style="width:50%;margin-top:auto;"></div>
        <span class="layout-card__label">Text Only</span>
      </div>
    </div>
  `;
  
  overlay.classList.add('open');
  
  body.querySelectorAll('[data-layout]').forEach(card => {
    card.addEventListener('click', () => {
      const layout = (card as HTMLElement).dataset.layout as SlideData['layoutType'];
      const slide = getActiveSlide();
      slide.layoutType = layout;
      slide.showDevice = layout !== 'blank' && layout !== 'text-only';
      closeModal();
      renderCanvas();
      renderSlideStrip();
    });
  });
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
}

// ============================================================
// EXPORT
// ============================================================
function exportSlide(index: number) {
  const savedIndex = state.activeSlideIndex;
  state.activeSlideIndex = index;
  renderCanvas();
  
  const link = document.createElement('a');
  link.download = `screenshot_${index + 1}_${getPreset().label.replace(/[\s"]/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  state.activeSlideIndex = savedIndex;
  renderCanvas();
}

function exportAll() {
  // Small delay between exports to avoid browser blocking
  state.slides.forEach((_, i) => {
    setTimeout(() => exportSlide(i), i * 300);
  });
}

// ============================================================
// EVENT BINDINGS
// ============================================================
function bindEvents() {
  // Settings (open via properties panel)
  $('#btn-settings')?.addEventListener('click', () => togglePanel('settings'));
  
  // Add slide
  $('#btn-add-slide')?.addEventListener('click', addSlide);
  
  // Export
  $('#btn-export')?.addEventListener('click', exportAll);
  $('#btn-download-all')?.addEventListener('click', exportAll);
  
  // Device selector (header)
  const deviceSelector = document.getElementById('device-selector') as HTMLSelectElement;
  deviceSelector?.addEventListener('change', () => {
    state.devicePreset = deviceSelector.value;
    renderSlideStrip();
    renderCanvas();
  });
  
  // Device color selector
  const deviceColorSelector = document.getElementById('device-color-selector') as HTMLSelectElement;
  deviceColorSelector?.addEventListener('change', () => {
    state.deviceColor = deviceColorSelector.value;
    renderSlideStrip();
    renderCanvas();
  });
  
  // Notch toggle
  const notchToggle = document.getElementById('notch-toggle') as HTMLInputElement;
  notchToggle?.addEventListener('change', () => {
    state.showNotch = notchToggle.checked;
    renderSlideStrip();
    renderCanvas();
  });
  
  // Text heading / body buttons
  $('#btn-text-heading')?.addEventListener('click', () => togglePanel('text'));
  $('#btn-text-body')?.addEventListener('click', () => togglePanel('text'));
  
  // Preview (just export all for now)
  $('#btn-preview')?.addEventListener('click', () => {
    // Simple preview: open canvas in new tab
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open();
    if (win) {
      win.document.write(`<html><head><title>Preview</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#111;}</style></head><body><img src="${dataUrl}" style="max-width:90vw;max-height:90vh;"/></body></html>`);
    }
  });
  
  // Modal close
  $('#modal-close')?.addEventListener('click', closeModal);
  $('#modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // File input
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.[0]) {
      loadScreenshot(fileInput.files[0]);
      fileInput.value = '';
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      exportAll();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      duplicateSlide(state.activeSlideIndex);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      // Undo placeholder - will be implemented fully later
    }
    if (e.key === 'ArrowLeft') {
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (state.activeSlideIndex > 0) {
          state.activeSlideIndex--;
          renderSlideStrip();
          renderCanvas();
          if (state.activePanel) openPanel(state.activePanel);
        }
      }
    }
    if (e.key === 'ArrowRight') {
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        if (state.activeSlideIndex < state.slides.length - 1) {
          state.activeSlideIndex++;
          renderSlideStrip();
          renderCanvas();
          if (state.activePanel) openPanel(state.activePanel);
        }
      }
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        deleteSlide(state.activeSlideIndex);
      }
    }
  });
  
  // Window resize
  window.addEventListener('resize', () => renderCanvas());
}

// ============================================================
// SIDEBAR INITIALIZATION
// ============================================================
function initSidebar() {
  // --- Template Colors ---
  const colorsContainer = document.getElementById('template-colors');
  if (colorsContainer) {
    TEMPLATE_COLORS.forEach(color => {
      const swatch = document.createElement('div');
      swatch.className = 'template-color-swatch';
      swatch.style.background = color;
      swatch.title = color;
      swatch.addEventListener('click', () => {
        // Apply as bg to active slide
        const slide = getActiveSlide();
        slide.bgColor = color;
        slide.bgType = 'solid';
        renderCanvas();
        renderSlideStrip();
        renderInlineBgPanel();
      });
      colorsContainer.appendChild(swatch);
    });
  }
  
  // --- Stickers Grid ---
  const stickerGrid = document.getElementById('sticker-grid');
  if (stickerGrid) {
    STICKER_EMOJIS.forEach(emoji => {
      const item = document.createElement('div');
      item.className = 'sticker-item';
      item.textContent = emoji;
      item.title = 'Add sticker (coming soon)';
      stickerGrid.appendChild(item);
    });
  }
  
  // --- Inline Background Panel ---
  renderInlineBgPanel();
  
  // --- Screenshot Drop Zone in Sidebar ---
  const dropZone = document.getElementById('screenshot-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('click', () => {
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      fileInput.click();
    });
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const files = (e as DragEvent).dataTransfer?.files;
      if (files?.[0]) loadScreenshot(files[0]);
    });
  }
}

// ============================================================
// INLINE BACKGROUND PANEL (in sidebar)
// ============================================================
function renderInlineBgPanel() {
  const container = document.getElementById('bg-panel-inline');
  if (!container) return;
  
  const slide = getActiveSlide();
  container.innerHTML = `
    <div class="tabs" style="margin-bottom:var(--sp-3);">
      <button class="tab-btn ${slide.bgType === 'solid' ? 'active' : ''}" data-bg-type="solid">Solid</button>
      <button class="tab-btn ${slide.bgType === 'gradient' ? 'active' : ''}" data-bg-type="gradient">Gradient</button>
    </div>
    ${slide.bgType === 'solid' ? `
      <div class="color-presets">
        ${COLOR_PRESETS.map(c => `
          <div class="color-presets__item ${slide.bgColor === c ? 'active' : ''}" 
               style="background:${c}" data-color="${c}"></div>
        `).join('')}
      </div>
    ` : `
      <div class="gradient-presets" style="grid-template-columns:repeat(3,1fr);">
        ${GRADIENT_PRESETS.map((g, i) => `
          <div class="gradient-presets__item ${slide.bgGradient === g ? 'active' : ''}" 
               style="background:${g}" data-gradient-index="${i}"></div>
        `).join('')}
      </div>
    `}
  `;
  
  // Events
  container.querySelectorAll('[data-bg-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      slide.bgType = (btn as HTMLElement).dataset.bgType as 'solid' | 'gradient';
      renderInlineBgPanel();
      renderCanvas();
    });
  });
  
  container.querySelectorAll('[data-color]').forEach(item => {
    item.addEventListener('click', () => {
      slide.bgColor = (item as HTMLElement).dataset.color!;
      slide.bgType = 'solid';
      renderInlineBgPanel();
      renderCanvas();
    });
  });
  
  container.querySelectorAll('[data-gradient-index]').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt((item as HTMLElement).dataset.gradientIndex!);
      slide.bgGradient = GRADIENT_PRESETS[idx];
      slide.bgType = 'gradient';
      renderInlineBgPanel();
      renderCanvas();
    });
  });
}

// ============================================================
// INIT
// ============================================================
function init() {
  bindEvents();
  initSidebar();
  renderSlideStrip();
  renderCanvas();
}

// Boot
document.addEventListener('DOMContentLoaded', init);
