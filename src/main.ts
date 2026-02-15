
import './style.css';
import { 
  state, 
  setCallbacks, 
  triggerUpdate, 
  createDefaultSlide,
  undo, 
  redo, 
  duplicateSlide,
  deleteSlide,
  setActiveSlide
} from './core/state';
import { renderCanvas } from './components/Canvas';
import { 
  initSidebar, 
  renderSlideStrip, 
  renderInlineBgPanel, 
  updatePropertiesPanel 
} from './components/Sidebar';
import { initExport } from './components/Export';
import { 
  handleCanvasMouseDown, 
  handleCanvasMouseMove, 
  handleCanvasMouseUp, 
  handleStickerWheel 
} from './components/Stickers';
// import { $ } from './core/utils'; <-- Unused

// ============================================================
// INITIALIZATION
// ============================================================

// 1. Setup State System
state.slides = [createDefaultSlide()];
setActiveSlide(0);

setCallbacks(
  // Update UI Callback
  () => {
    renderCanvas();        // Main viewport
    renderSlideStrip();    // Bottom thumbnails
    renderInlineBgPanel(); // Left panel (backgrounds)
    updatePropertiesPanel(); // Right panel (contextual)
  },
  // History Change Callback
  (canUndo, canRedo) => {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.style.opacity = canUndo ? '1' : '0.3';
    if (btnUndo) (btnUndo as HTMLButtonElement).disabled = !canUndo;
    
    if (btnRedo) btnRedo.style.opacity = canRedo ? '1' : '0.3';
    if (btnRedo) (btnRedo as HTMLButtonElement).disabled = !canRedo;
  }
);

// 2. Initialize Components
initSidebar();
initExport();

// 3. Bind Global Interaction Events
const viewport = document.getElementById('slides-viewport');
if (viewport) {
  viewport.addEventListener('mousedown', handleCanvasMouseDown);
  window.addEventListener('mousemove', handleCanvasMouseMove); // Window to track drag outside
  window.addEventListener('mouseup', handleCanvasMouseUp);
  // Also mouseleave on viewport to clear state if needed, but window mouseup handles most cases
  
  viewport.addEventListener('wheel', handleStickerWheel, { passive: false });
}

// 4. Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  // Undo/Redo
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
  }
  
  // Export
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    (document.getElementById('btn-export') as HTMLElement)?.click();
  }
  
  // Duplicate
  if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
    e.preventDefault();
    duplicateSlide(state.activeSlideIndex);
  }
  
  // Delete
  if (e.key === 'Delete' || e.key === 'Backspace') {
    // Only if not focused on input
    const activeTag = document.activeElement?.tagName;
    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
      deleteSlide(state.activeSlideIndex);
    }
  }
  
  // Navigation
  if (e.key === 'ArrowLeft') {
    const activeTag = document.activeElement?.tagName;
    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
      if (state.activeSlideIndex > 0) {
        setActiveSlide(state.activeSlideIndex - 1);
      }
    }
  }
  
  if (e.key === 'ArrowRight') {
    const activeTag = document.activeElement?.tagName;
    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
      if (state.activeSlideIndex < state.slides.length - 1) {
        setActiveSlide(state.activeSlideIndex + 1);
      }
    }
  }
});

// 5. Override window resize to re-render (responsive canvas sizing)
window.addEventListener('resize', () => {
  renderCanvas();
});


// 6. Initial Kickoff
triggerUpdate();
