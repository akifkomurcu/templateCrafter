
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
  const transformRoot = document.getElementById('canvas-transform-root');
  if (!viewport || !transformRoot) return;
  
  // Initialize Viewport Events (Once)
  if (!viewport.dataset.eventsMetrics) {
    viewport.dataset.eventsMetrics = 'true';
    initViewportEvents(viewport);
  }
  
  const preset = DEVICE_PRESETS[state.devicePreset];
  
  
  // Height-based sizing: fit slides to available height
  // Use a fixed base height or available height, but we want it to be scrollable if zoomed.
  const baseHeight = 500; 
  const displayH = baseHeight; 
  const aspectRatio = preset.width / preset.height;
  const displayW = displayH * aspectRatio;
  
  // Update Transform Root Style
  transformRoot.style.transform = `translate(${state.canvasPanX}px, ${state.canvasPanY}px) scale(${state.canvasScale})`;
  transformRoot.style.transformOrigin = 'center center'; // Or top left? Center is usually better for zoom
  // Actually standard pan/zoom usually uses top-left origin + offset/scale.
  // But let's stick to center for simplicity if it works, or switch to 0 0.
  // Center alignment in CSS flex is already doing centering.
  
  // Reuse or rebuild canvas elements
  const existingWrappers = transformRoot.querySelectorAll('.slide-canvas-wrapper');
  
  // Only rebuild DOM if slide count changed
  if (existingWrappers.length !== state.slides.length) {
    transformRoot.innerHTML = '';
    
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
      
      transformRoot.appendChild(wrapper);
    });
  }
  
  // Render each slide onto its canvas
  const wrappers = transformRoot.querySelectorAll('.slide-canvas-wrapper');
  wrappers.forEach((wrapper, index) => {
    const w = wrapper as HTMLElement;
    w.className = `slide-canvas-wrapper ${index === state.activeSlideIndex ? 'active' : ''}`;
    
    const cvs = w.querySelector('canvas')!;
    // Ensure dimensions match current preset (if changed)
    if (cvs.width !== preset.width || cvs.height !== preset.height) {
        cvs.width = preset.width;
        cvs.height = preset.height;
    }
    cvs.style.width = displayW + 'px';
    cvs.style.height = displayH + 'px';
    
    // Set global canvas/ctx to this slide's canvas for drawing functions
    canvas = cvs;
    ctx = cvs.getContext('2d')!;
    
    drawSlideContent(state.slides[index], preset, index, state.slides.length);
    
    // Update thumbnail for this slide
    // Need to capture current canvas state
    const currentCanvas = cvs;
    setTimeout(() => updateThumbnail(index, currentCanvas), 0);
  });
  
  // Update Zoom Indicator
  const zoomInd = document.getElementById('canvas-zoom-indicator');
  if (zoomInd) {
    zoomInd.innerText = `${Math.round(state.canvasScale * 100)}%`;
  }
}

function initViewportEvents(viewport: HTMLElement) {
    // Zoom Indicator Reset
    const zoomInd = document.getElementById('canvas-zoom-indicator');
    if (zoomInd) {
        zoomInd.addEventListener('click', () => {
            state.canvasScale = 1;
            state.canvasPanX = 0;
            state.canvasPanY = 0;
            triggerUpdate();
        });
    }

    // Wheel Zoom & Pan
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        // Ctrl + Wheel = Zoom
        if (e.ctrlKey || e.metaKey) {
            const zoomSpeed = 0.001;
            const newScale = state.canvasScale - e.deltaY * zoomSpeed;
            // Clamp scale
            state.canvasScale = Math.min(Math.max(0.1, newScale), 5);
        } else {
            // Pan
            state.canvasPanX -= e.deltaX;
            state.canvasPanY -= e.deltaY;
        }
        triggerUpdate();
    }, { passive: false });

    // Drag Pan Logic
    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let isSpacePressed = false;

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !isSpacePressed) {
            isSpacePressed = true;
            viewport.style.cursor = 'grab';
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = false;
            if (!isPanning) viewport.style.cursor = 'default';
        }
    });

    viewport.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement;
        const wrapper = target.closest('.slide-canvas-wrapper');
        const isSlide = !!wrapper;
        
        // 1. Pan Interaction (Middle Click, or Space/Shift + Left, or Background Left)
        if (e.button === 1 || (e.button === 0 && (isSpacePressed || e.shiftKey || !isSlide))) {
            isPanning = true;
            startX = e.clientX;
            startY = e.clientY;
            viewport.style.cursor = 'grabbing';
            if (!isSlide) e.preventDefault(); 
            return;
        }
        
        // 2. Element Drag Interaction (Left Click on Slide)
        if (isSlide && e.button === 0) {
            const index = parseInt((wrapper as HTMLElement).dataset.slideIndex || '0');
            const regions = elementHitRegions.get(index);
            
            if (regions) {
                // Get Mouse Position relative to Canvas
                const canvas = wrapper!.querySelector('canvas');
                if (!canvas) return;
                
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                const mouseX = (e.clientX - rect.left) * scaleX;
                const mouseY = (e.clientY - rect.top) * scaleY;
                
                // Helper to check hit
                const checkHit = (box: {x: number, y: number, w: number, h: number} | undefined) => {
                    return box && 
                           mouseX >= box.x && mouseX <= box.x + box.w &&
                           mouseY >= box.y && mouseY <= box.y + box.h;
                };

                // Check Title
                if (checkHit(regions.title)) {
                    state.draggingElement = { slideIndex: index, type: 'title' };
                    state.dragStartX = mouseX - regions.title!.x; 
                    state.dragStartY = mouseY - regions.title!.y;
                    viewport.style.cursor = 'move';
                    return;
                }
                
                // Check Subtitle
                if (checkHit(regions.subtitle)) {
                    state.draggingElement = { slideIndex: index, type: 'subtitle' };
                    state.dragStartX = mouseX - regions.subtitle!.x; 
                    state.dragStartY = mouseY - regions.subtitle!.y;
                    viewport.style.cursor = 'move';
                    return;
                }
                
                // Check Device (Lower priority than text? or Higher? Text usually on top)
                if (checkHit(regions.device)) {
                    state.draggingElement = { slideIndex: index, type: 'device' };
                    state.dragStartX = mouseX - regions.device!.x; 
                    state.dragStartY = mouseY - regions.device!.y;
                    viewport.style.cursor = 'move';
                    return;
                }
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        // Handle Pan
        if (isPanning) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            let newPanX = state.canvasPanX + dx;
            let newPanY = state.canvasPanY + dy;
            
            const preset = DEVICE_PRESETS[state.devicePreset];
            const aspectRatio = preset.width / preset.height;
            const displayW = 500 * aspectRatio; 
            const totalContentW = state.slides.length * (displayW + 40); 
            
            const marginX = Math.max(window.innerWidth, totalContentW) * 0.8;
            const marginY = window.innerHeight * 0.8;

            state.canvasPanX = Math.max(-totalContentW - marginX, Math.min(marginX, newPanX));
            state.canvasPanY = Math.max(-marginY, Math.min(marginY, newPanY));
            
            startX = e.clientX;
            startY = e.clientY;
            triggerUpdate();
            return;
        }
        
        // Handle Element Drag
        if (state.draggingElement) {
            const { slideIndex, type } = state.draggingElement;
            const wrapper = document.querySelector(`.slide-canvas-wrapper[data-slide-index="${slideIndex}"]`);
            if (!wrapper) return;
            
            const canvas = wrapper.querySelector('canvas');
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            
            // New Top-Left Position
            let newX = mouseX - state.dragStartX;
            let newY = mouseY - state.dragStartY;
            
            // Constraints
            const regions = elementHitRegions.get(slideIndex);
            // Get dimensions based on type
            let w = 0, h = 0;
            if (type === 'title') { w = regions?.title?.w || 0; h = regions?.title?.h || 0; }
            else if (type === 'subtitle') { w = regions?.subtitle?.w || 0; h = regions?.subtitle?.h || 0; }
            else if (type === 'device') { w = regions?.device?.w || 0; h = regions?.device?.h || 0; }
            
            // Constrain Logic
            const minX = Math.min(0, canvas.width - w);
            const maxX = Math.max(0, canvas.width - w);
            const minY = Math.min(0, canvas.height - h);
            const maxY = Math.max(0, canvas.height - h);
            
            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));
            
            // Snap Logic
            const preset = DEVICE_PRESETS[state.devicePreset];
            const centerX = preset.width / 2; // Use preset width, not canvas.width (which might be scaled/display)
            const centerY = preset.height / 2;
            const threshold = 25; // Increased threshold
            
            let snappedX = newX;
            let snappedY = newY;
            let isSnappedX = false;
            let isSnappedY = false;
            
            // Calculate center of dragged element
            const elementCenterX = newX + w / 2;
            const elementCenterY = newY + h / 2;
            
            if (Math.abs(elementCenterX - centerX) < threshold) {
                snappedX = centerX - w / 2;
                isSnappedX = true;
            }
            
            if (Math.abs(elementCenterY - centerY) < threshold) {
                snappedY = centerY - h / 2;
                isSnappedY = true;
            }
            
            // Update Snap Visualization State
            state.snapToCenterX = isSnappedX;
            state.snapToCenterY = isSnappedY;
            
            // Use Snapped Coordinates
            newX = snappedX;
            newY = snappedY;
            
            // Update State
            if (type === 'title') {
                const align = state.slides[slideIndex].titleAlign;
                let anchorX = newX;
                if (align === 'center') anchorX = newX + w / 2;
                else if (align === 'right') anchorX = newX + w;
                state.slides[slideIndex].titlePos = { x: anchorX, y: newY };
            } else if (type === 'subtitle') {
                const align = state.slides[slideIndex].titleAlign;
                let anchorX = newX;
                if (align === 'center') anchorX = newX + w / 2;
                else if (align === 'right') anchorX = newX + w;
                state.slides[slideIndex].subtitlePos = { x: anchorX, y: newY };
            } else if (type === 'device') {
                state.slides[slideIndex].devicePos = { x: newX, y: newY };
            }
            triggerUpdate();
        }
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            viewport.style.cursor = isSpacePressed ? 'grab' : 'default';
        }
        if (state.draggingElement) {
            state.draggingElement = null;
            state.snapToCenterX = false;
            state.snapToCenterY = false;
            viewport.style.cursor = 'default';
            triggerUpdate(); // Clear guidelines
        }
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
    drawText(slide, preset, index);
  }
  
  // Draw device frame + screenshot
  if (slide.showDevice && slide.layoutType !== 'blank' && slide.layoutType !== 'text-only') {
    drawDeviceFrame(slide, preset, index);
  }
  
  // Draw stickers
  if (slide.stickers?.length) {
    drawStickers(slide);
  }
  
  // Draw Snap Guides (Overlay)
  drawGuides(preset, index);
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

// Element Drag Helper State (Text + Device)
const elementHitRegions = new Map<number, { 
    title?: { x: number, y: number, w: number, h: number }, 
    subtitle?: { x: number, y: number, w: number, h: number },
    device?: { x: number, y: number, w: number, h: number }
}>();

function drawText(slide: SlideData, preset: DevicePreset, slideIndex: number) {
  // Use custom position if available, or calculate default
  const defaultTitleX = slide.titleAlign === 'center' ? preset.width / 2 :
                        slide.titleAlign === 'left' ? preset.width * 0.08 :
                        preset.width * 0.92;
  const defaultTitleY = preset.height * 0.08;
  
  const titleX = slide.titlePos ? slide.titlePos.x : defaultTitleX;
  const titleY = slide.titlePos ? slide.titlePos.y : defaultTitleY;
  
  // Update state if not set (for consistency when dragging starts)
  // Actually we shouldn't mutate state during render, but we need these values for drag start.
  // We'll rely on hit regions being accurate.
  
  // Title
  ctx.textAlign = slide.titleAlign;
  ctx.textBaseline = 'top';
  ctx.font = `800 ${slide.titleSize}px "${slide.fontFamily}", sans-serif`;
  ctx.fillStyle = slide.titleColor;
  
  // Measure Title
  // Since wrapText draws, we need to know size. wrapText doesn't return size easily without refactoring.
  // Let's assume max width is fixed for now? Or re-measure.
  const maxW = preset.width * 0.84;
  const titleLines = getWrappedLines(ctx, slide.title, maxW);
  const titleH = titleLines.length * slide.titleSize * 1.2;
  
  // Calculate bounding box based on alignment
  // Better bounding box: measure widest line?
  let realMaxW = 0;
  titleLines.forEach(l => {
      const w = ctx.measureText(l).width;
      if (w > realMaxW) realMaxW = w;
  });
  
  let boxX = titleX;
  if (slide.titleAlign === 'center') boxX = titleX - realMaxW / 2;
  else if (slide.titleAlign === 'right') boxX = titleX - realMaxW;
  
  // Store Hit Region
  const regions = elementHitRegions.get(slideIndex) || {};
  regions.title = { x: boxX, y: titleY, w: realMaxW, h: titleH };
  elementHitRegions.set(slideIndex, regions);

  // Draw Title
  wrapText(ctx, slide.title, titleX, titleY, maxW, slide.titleSize * 1.2);
  
  // Subtitle
  const defaultSubtitleY = defaultTitleY + titleH + 20;
  const subtitleX = slide.subtitlePos ? slide.subtitlePos.x : defaultTitleX; // Uses same align X
  const subtitleY = slide.subtitlePos ? slide.subtitlePos.y : (slide.titlePos ? slide.titlePos.y + titleH + 20 : defaultSubtitleY);
  
  ctx.font = `400 ${slide.subtitleSize}px "${slide.fontFamily}", sans-serif`;
  ctx.fillStyle = slide.subtitleColor;
  
  const subtitleLines = getWrappedLines(ctx, slide.subtitle, maxW);
  const subH = subtitleLines.length * slide.subtitleSize * 1.3;
  
  let subMaxW = 0;
  subtitleLines.forEach(l => {
     const w = ctx.measureText(l).width;
     if (w > subMaxW) subMaxW = w;
  });
  
  let subBoxX = subtitleX;
  if (slide.titleAlign === 'center') subBoxX = subtitleX - subMaxW / 2;
  else if (slide.titleAlign === 'right') subBoxX = subtitleX - subMaxW;

  regions.subtitle = { x: subBoxX, y: subtitleY, w: subMaxW, h: subH };
  
  wrapText(ctx, slide.subtitle, subtitleX, subtitleY, maxW, slide.subtitleSize * 1.3);
} 
// ...existing drawDeviceFrame...
// We'll update interactions in a separate chunk to keep edits manageable.

function drawDeviceFrame(slide: SlideData, preset: DevicePreset, slideIndex: number) {
  const category = DEVICE_PRESETS[state.devicePreset].category;
  
  const deviceW = preset.width * (slide.deviceScale / 100);
  const deviceH = deviceW * (category === 'ipad' ? 1.35 : 2.05);
  
  const defaultDeviceX = (preset.width - deviceW) / 2;
  const defaultDeviceY = preset.height * (slide.deviceOffsetY / 100);
  
  const deviceX = slide.devicePos ? slide.devicePos.x : defaultDeviceX;
  const deviceY = slide.devicePos ? slide.devicePos.y : defaultDeviceY;
  
  // Store Hit Region
  const regions = elementHitRegions.get(slideIndex) || {};
  regions.device = { x: deviceX, y: deviceY, w: deviceW, h: deviceH };
  elementHitRegions.set(slideIndex, regions);
  
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
}

function drawStickers(slide: SlideData) {
  if (!slide.stickers) return;
  
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff'; 
  
  slide.stickers.forEach(sticker => {
    ctx.font = `${sticker.size}px "Material Symbols Rounded", "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.fillText(sticker.content, sticker.x, sticker.y);
  });
  
  ctx.restore();
}

function drawGuides(preset: DevicePreset, slideIndex: number) {
  if (!state.snapToCenterX && !state.snapToCenterY) return;
  
  // Only draw guides if this is the slide being dragged on
  const dragIdx = state.draggingElement?.slideIndex;
  
  // Strict comparison
  if (dragIdx === undefined || Number(dragIdx) !== Number(slideIndex)) return;
  
  ctx.save();
  ctx.strokeStyle = '#ef4444'; // Red-500
  ctx.lineWidth = 2; // Thicker line
  ctx.setLineDash([8, 8]); // Bolder dash
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#ef4444';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  const centerX = preset.width / 2;
  const centerY = preset.height / 2;
  
  if (state.snapToCenterX) {
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, preset.height);
    ctx.stroke();
    // ctx.fillText('Center X', centerX + 5, 20); // Optional label
  }
  
  if (state.snapToCenterY) {
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(preset.width, centerY);
    ctx.stroke();
  }
  
  ctx.restore();
}

function updateThumbnail(index: number, sourceCanvas: HTMLCanvasElement) {
  const thumbEl = document.querySelector(`.slide-thumb[data-slide-index="${index}"]`);
  if (!thumbEl) return;
  const thumbCanvas = thumbEl.querySelector('canvas') as HTMLCanvasElement;
  if (!thumbCanvas || !sourceCanvas) return;
  
  const thumbCtx = thumbCanvas.getContext('2d')!;
  
  thumbCtx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
  thumbCtx.drawImage(sourceCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
}

// (Function moved above)
