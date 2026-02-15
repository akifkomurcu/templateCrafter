
import { state, triggerUpdate } from '../core/state';
import { DEVICE_PRESETS } from '../core/config';
import type { DevicePreset, SlideData } from '../core/types';
import { roundRect, wrapText, getWrappedLines, parseGradientColors, parseGradientAngle } from '../core/utils';

// ============================================================
// MODULE STATE
// ============================================================
export let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D; // Current context being drawn to
export const screenshotCache = new Map<string, HTMLImageElement>();

export function setCanvas(c: HTMLCanvasElement) {
  canvas = c;
  ctx = c.getContext('2d')!;
}

export function getCanvasContext() {
  return { canvas, ctx };
}

// ============================================================
// MAIN RENDER FUNCTION
// ============================================================
export function renderCanvas() {
  const viewport = document.getElementById('slides-viewport');
  if (!viewport) return;
  
  const preset = DEVICE_PRESETS[state.devicePreset];
  
  // Calculate display size for each slide
  const canvasArea = document.getElementById('canvas-area');
  const areaH = (canvasArea?.clientHeight || 600) - 100;
  const aspectRatio = preset.width / preset.height;
  
  // Height-based sizing: fit slides to available height
  const displayH = Math.min(areaH, 500);
  const displayW = displayH * aspectRatio;
  
  // Reuse or rebuild canvas elements
  const existingWrappers = viewport.querySelectorAll('.slide-canvas-wrapper');
  
  // Only rebuild DOM if slide count changed
  if (existingWrappers.length !== state.slides.length) {
    viewport.innerHTML = '';
    
    state.slides.forEach((_, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = `slide-canvas-wrapper ${index === state.activeSlideIndex ? 'active' : ''}`;
      wrapper.dataset.slideIndex = index.toString();
      
      const cvs = document.createElement('canvas');
      cvs.width = preset.width;
      cvs.height = preset.height;
      cvs.style.width = displayW + 'px';
      cvs.style.height = displayH + 'px';
      wrapper.appendChild(cvs);
      
      // Click to select
      wrapper.addEventListener('click', () => {
        state.activeSlideIndex = index;
        triggerUpdate();
      });
      
      viewport.appendChild(wrapper);
    });
  }
  
  // Render each slide onto its canvas
  const wrappers = viewport.querySelectorAll('.slide-canvas-wrapper');
  wrappers.forEach((wrapper, index) => {
    const w = wrapper as HTMLElement;
    w.className = `slide-canvas-wrapper ${index === state.activeSlideIndex ? 'active' : ''}`;
    
    const cvs = w.querySelector('canvas')!;
    cvs.width = preset.width;
    cvs.height = preset.height;
    cvs.style.width = displayW + 'px';
    cvs.style.height = displayH + 'px';
    
    // Set global canvas/ctx to this slide's canvas for drawing functions
    canvas = cvs;
    ctx = cvs.getContext('2d')!;
    
    drawSlideContent(state.slides[index], preset, index, state.slides.length);
    
    // Update thumbnail for this slide
    // Timeout ensuring renderSlideStrip has run if called via onUpdate
    setTimeout(() => updateThumbnail(index), 0);
  });
}

// ============================================================
// DRAWING HELPERS
// ============================================================
export function drawSlideContent(slide: SlideData, preset: DevicePreset, index: number, totalSlides: number) {
  // Clear
  ctx.clearRect(0, 0, preset.width, preset.height);
  
  // Draw background
  drawBackground(slide, preset, index, totalSlides);
  
  // Draw text
  if (slide.layoutType !== 'blank' && slide.layoutType !== 'device-only') {
    drawText(slide, preset);
  }
  
  // Draw device frame + screenshot
  if (slide.showDevice && slide.layoutType !== 'blank' && slide.layoutType !== 'text-only') {
    drawDeviceFrame(slide, preset);
  }
  
  // Draw stickers
  if (slide.stickers?.length) {
    drawStickers(slide);
  }
}

function drawBackground(slide: SlideData, preset: DevicePreset, slideIndex: number = 0, totalSlides: number = 1) {
  if (slide.bgType === 'image' && slide.bgImage) {
    // Draw a fallback color first
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, preset.width, preset.height);
    
    // Check cache
    if (screenshotCache.has(slide.bgImage)) {
      const img = screenshotCache.get(slide.bgImage)!;
      
      // Panoramic spanning: the image covers all slides placed side-by-side
      const totalW = preset.width * totalSlides;
      const totalH = preset.height;
      
      const imgAspect = img.width / img.height;
      const totalAspect = totalW / totalH;
      let fitW: number, fitH: number, fitX: number, fitY: number;
      
      if (imgAspect > totalAspect) {
        fitH = totalH;
        fitW = fitH * imgAspect;
        fitX = -(fitW - totalW) / 2;
        fitY = 0;
      } else {
        fitW = totalW;
        fitH = fitW / imgAspect;
        fitX = 0;
        fitY = -(fitH - totalH) / 2;
      }
      
      const offsetX = slideIndex * preset.width;
      ctx.drawImage(img, fitX - offsetX, fitY, fitW, fitH);
    } else {
      // Load and cache
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        screenshotCache.set(slide.bgImage!, img);
        triggerUpdate(); // Re-render once loaded
      };
      img.src = slide.bgImage;
    }
    return;
  }
  
  if (slide.bgType === 'gradient') {
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

function drawText(slide: SlideData, preset: DevicePreset) {
  const titleY = preset.height * 0.08;
  
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

function drawDeviceFrame(slide: SlideData, preset: DevicePreset) {
  const category = DEVICE_PRESETS[state.devicePreset].category;
  
  const deviceW = preset.width * (slide.deviceScale / 100);
  const deviceH = deviceW * (category === 'ipad' ? 1.35 : 2.05);
  const deviceX = (preset.width - deviceW) / 2;
  const deviceY = preset.height * (slide.deviceOffsetY / 100);
  
  const radius = deviceW * 0.08;
  const bezelW = deviceW * 0.025;
  
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  
  const frameColors: Record<string, string> = {
    black: '#1a1a1a',
    silver: '#c0c0c0',
    gold: '#d4af37',
  };
  ctx.fillStyle = frameColors[state.deviceColor] || '#1a1a1a';
  roundRect(ctx, deviceX, deviceY, deviceW, deviceH, radius);
  ctx.fill();
  ctx.restore();
  
  const screenX = deviceX + bezelW;
  const screenY = deviceY + bezelW;
  const screenW = deviceW - bezelW * 2;
  const screenH = deviceH - bezelW * 2;
  const screenRadius = radius * 0.85;
  
  if (slide.screenshotSrc && screenshotCache.has(slide.screenshotSrc)) {
    const img = screenshotCache.get(slide.screenshotSrc)!;
    
    ctx.save();
    roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
    ctx.clip();
    
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
  
  // Notch
  if (category === 'iphone' && state.showNotch) {
    const notchW = deviceW * 0.3;
    const notchH = deviceW * 0.065;
    const notchX = deviceX + (deviceW - notchW) / 2;
    const notchY = deviceY + bezelW + 12;
    
    ctx.fillStyle = '#1a1a1a';
    roundRect(ctx, notchX, notchY, notchW, notchH, notchH / 2);
    ctx.fill();
  }
  
  // Home indicator
  const indicatorW = deviceW * 0.35;
  const indicatorH = 5;
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  roundRect(ctx, deviceX + (deviceW - indicatorW) / 2, deviceY + deviceH - bezelW - 20, indicatorW, indicatorH, indicatorH / 2);
  ctx.fill();
  
  // Stickers layer handled by drawSlideContent but drawDeviceFrame does it too?
  // In original main.ts, drawDeviceFrame called drawStickers, AND renderCanvas called drawStickers.
  // Wait, if I call drawStickers here, it renders ON TOP of device.
  // Checking original code:
  // renderCanvas calls drawStickers at the end.
  // drawDeviceFrame ALSO calls drawStickers at the end. Make sure we don't double render.
  // Actually, I should check if stickes are above or below device?
  // Original code: drawDeviceFrame calls drawStickers(slide).
  // AND renderCanvas calls drawStickers(slide).
  // This seems redundant or intentional for layering?
  // Code Item 1010 shows drawDeviceFrame calls drawStickers(slide).
  // Code Item 1004 shows renderCanvas calls drawStickers(slide).
  // Double rendering! I'll keep it in drawDeviceFrame if it's there for z-index reasons (device frame might clip otherwise?).
  // But drawDeviceFrame is inside renderCanvas.
  // Let's remove it from renderCanvas if drawDeviceFrame handles it, OR remove from drawDeviceFrame.
  // Stickers should be on top of everything. `drawDeviceFrame` is good.
  // But if showDevice is false, `drawDeviceFrame` isn't called. So `renderCanvas` must call it too?
  // Yes.
  // Ensure we don't render twice if device is shown.
  // I'll leave logic as matches original for now to ensure behavior consistency.
}

function drawStickers(slide: SlideData) {
  if (!slide.stickers) return;
  
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff'; 
  
  slide.stickers.forEach(sticker => {
    ctx.font = `${sticker.size}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;
    ctx.fillText(sticker.content, sticker.x, sticker.y);
  });
  
  ctx.restore();
}

function updateThumbnail(index: number) {
  const thumbEl = document.querySelector(`.slide-thumb[data-slide-index="${index}"]`);
  if (!thumbEl) return;
  const thumbCanvas = thumbEl.querySelector('canvas') as HTMLCanvasElement;
  if (!thumbCanvas || !canvas) return;
  
  const thumbCtx = thumbCanvas.getContext('2d')!;
  
  thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
  // canvas here is the global module variable that was just drawn to
  thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
}
