
import { state, triggerUpdate, saveSnapshot, getActiveSlide, setActiveSlide } from '../core/state';
// import { DEVICE_PRESETS } from '../core/config';

// ============================================================
// STICKER INTERACTIONS
// ============================================================
export function handleCanvasMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.tagName !== 'CANVAS') return;
  
  const wrapper = target.closest('.slide-canvas-wrapper') as HTMLElement;
  if (!wrapper) return;
  
  const index = parseInt(wrapper.dataset.slideIndex || '0');
  
  // Switch slide if needed
  if (index !== state.activeSlideIndex) {
    setActiveSlide(index);
  }
  
  const slide = getActiveSlide();
  if (!slide.stickers?.length) return;
  
  const { x, y } = getMousePos(e, target as HTMLCanvasElement);
  
  // Check if clicked on a sticker (reverse to select top-most)
  const clickedSticker = [...slide.stickers].reverse().find(s => {
    // Simple hit detection (box)
    const halfSize = s.size / 2;
    return x >= s.x - halfSize && x <= s.x + halfSize &&
           y >= s.y - halfSize && y <= s.y + halfSize;
  });
  
  if (clickedSticker) {
    state.selectedStickerId = clickedSticker.id;
    state.draggingStickerId = clickedSticker.id;
    state.dragStartX = x;
    state.dragStartY = y;
    state.initialStickerX = clickedSticker.x;
    state.initialStickerY = clickedSticker.y;
    
    // Snapshot for undo
    saveSnapshot();
    
    triggerUpdate();
  } else {
    // Deselect if clicked empty space
    if (state.selectedStickerId) {
      state.selectedStickerId = null;
      triggerUpdate();
    }
  }
}

export function handleCanvasMouseMove(e: MouseEvent) {
  if (!state.draggingStickerId) return;
  
  // const target = e.target as HTMLElement;
  // If dragging output of canvas, we might lose context, but usually mouseup handles it.
  // We need coordinates relative to the ACTIVE canvas.
  // Finding the active canvas:
  const wrapper = document.querySelector(`.slide-canvas-wrapper[data-slide-index="${state.activeSlideIndex}"]`);
  const canvas = wrapper?.querySelector('canvas');
  if (!canvas) return;
  
  const { x, y } = getMousePos(e, canvas);
  const dx = x - state.dragStartX;
  const dy = y - state.dragStartY;
  
  const slide = getActiveSlide();
  const sticker = slide.stickers?.find(s => s.id === state.draggingStickerId);
  
  if (sticker) {
    sticker.x = state.initialStickerX + dx;
    sticker.y = state.initialStickerY + dy;
    triggerUpdate();
  }
}

export function handleCanvasMouseUp() {
  if (state.draggingStickerId) {
    state.draggingStickerId = null;
  }
}

function getMousePos(evt: MouseEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

export function handleStickerWheel(e: WheelEvent) {
  if (state.selectedStickerId) {
    e.preventDefault();
    const slide = getActiveSlide();
    const sticker = slide.stickers?.find(s => s.id === state.selectedStickerId);
    if (sticker) {
      const delta = e.deltaY > 0 ? -10 : 10;
      sticker.size = Math.max(20, sticker.size + delta);
      // saveSnapshot? Maybe debounced? 
      // For now, no snapshot on every resize tick to avoid spamming history.
      triggerUpdate();
    }
  }
}
