
import type { AppState, SlideData } from './types';
import { uid } from './utils';
import { TEMPLATE_COLORS } from './config';

// ============================================================
// STATE
// ============================================================
export const state: AppState = {
  slides: [],
  activeSlideIndex: 0,
  devicePreset: 'iphone-6.5',
  deviceColor: 'black',
  showNotch: true,
  activePanel: null,
  selectedStickerId: null,
  
  draggingStickerId: null,
  draggingElement: null,
  dragStartX: 0,
  dragStartY: 0,
  initialStickerX: 0,
  initialStickerY: 0,
  
  // Canvas View
  canvasScale: 1,
  canvasPanX: 0,
  canvasPanY: 0,
  snapToCenterX: false,
  snapToCenterY: false,
  
  undoStack: [],
  redoStack: []
};


// ============================================================
// FACTORY
// ============================================================
export function createDefaultSlide(): SlideData {
  return {
    id: uid(),
    title: 'Your Amazing App',
    subtitle: 'Subtitle goes here',
    titleColor: '#ffffff',
    subtitleColor: '#ccccdd',
    titleSize: 64,
    subtitleSize: 36,
    
    titleAlign: 'center',
    titlePos: null,
    subtitlePos: null,
    bgType: 'solid',
    bgColor: TEMPLATE_COLORS[Math.floor(Math.random() * TEMPLATE_COLORS.length)],
    bgGradient: 'linear-gradient(135deg, #7c5cfc 0%, #38bdf8 100%)',
    bgImage: null,
    
    screenshotSrc: null,
    layoutType: 'text-device',
    
    showDevice: true,
    deviceOffsetY: 10,
    deviceScale: 85,
    devicePos: null,
    
    fontFamily: 'Inter',
    stickers: []
  };
}


// ============================================================
// HISTORY (UNDO/REDO)
// ============================================================
const MAX_HISTORY = 50;

// Callbacks to update UI
let onUpdate = () => {};
let onHistoryChange = (_canUndo: boolean, _canRedo: boolean) => {};


export function setCallbacks(
  updateFn: () => void, 
  historyFn: (canUndo: boolean, canRedo: boolean) => void
) {
  onUpdate = updateFn;
  onHistoryChange = historyFn;
}

export function triggerUpdate() {
  onUpdate();
}

export function saveSnapshot() {
  // Deep clone current state (excluding stacks to avoid recursion)
  const snapshot = JSON.stringify({
    slides: state.slides,
    activeSlideIndex: state.activeSlideIndex,
    devicePreset: state.devicePreset,
    deviceColor: state.deviceColor,
    showNotch: state.showNotch,
    activePanel: state.activePanel,
    selectedStickerId: state.selectedStickerId
  });
  
  // Don't save if identical to top of stack
  if (state.undoStack.length > 0 && state.undoStack[state.undoStack.length - 1] === snapshot) {
    return;
  }
  
  state.undoStack.push(snapshot);
  if (state.undoStack.length > MAX_HISTORY) state.undoStack.shift();
  
  // Clear redo stack on new action
  state.redoStack = [];
  
  notifyHistory();
}

export function undo() {
  if (state.undoStack.length === 0) return;
  
  // Save current state to redo stack before restoring
  const currentSnapshot = JSON.stringify({
    slides: state.slides,
    activeSlideIndex: state.activeSlideIndex,
    devicePreset: state.devicePreset,
    deviceColor: state.deviceColor,
    showNotch: state.showNotch,
    activePanel: state.activePanel,
    selectedStickerId: state.selectedStickerId
  });
  state.redoStack.push(currentSnapshot);
  
  const snapshot = state.undoStack.pop();
  if (snapshot) {
    restoreState(snapshot);
  }
  
  notifyHistory();
}

export function redo() {
  if (state.redoStack.length === 0) return;
  
  // Save current (undoable) state to undo stack
  const currentSnapshot = JSON.stringify({
    slides: state.slides,
    activeSlideIndex: state.activeSlideIndex,
    devicePreset: state.devicePreset,
    deviceColor: state.deviceColor,
    showNotch: state.showNotch,
    activePanel: state.activePanel,
    selectedStickerId: state.selectedStickerId
  });
  state.undoStack.push(currentSnapshot);
  
  const snapshot = state.redoStack.pop();
  if (snapshot) {
    restoreState(snapshot);
  }
  
  notifyHistory();
}

function restoreState(json: string) {
  const data = JSON.parse(json);
  state.slides = data.slides;
  state.activeSlideIndex = data.activeSlideIndex;
  state.devicePreset = data.devicePreset;
  state.deviceColor = data.deviceColor;
  state.showNotch = data.showNotch;
  state.activePanel = data.activePanel;
  state.selectedStickerId = data.selectedStickerId;
  
  onUpdate();
}


function notifyHistory() {
  onHistoryChange(state.undoStack.length > 0, state.redoStack.length > 0);
}

// ============================================================
// HELPERS & ACTIONS
// ============================================================
export function getActiveSlide(): SlideData {
  return state.slides[state.activeSlideIndex];
}

export function setActiveSlide(index: number) {
  state.activeSlideIndex = index;
  triggerUpdate();
}

export function setActivePanel(panel: string | null) {
  state.activePanel = panel;
  triggerUpdate();
}

export function addSlide() {
  saveSnapshot();
  const newSlide = createDefaultSlide();
  // Copy styles from previous if exists
  if (state.slides.length > 0) {
    const prev = state.slides[state.slides.length - 1];
    newSlide.bgType = prev.bgType;
    newSlide.bgColor = prev.bgColor;
    newSlide.bgGradient = prev.bgGradient;
    newSlide.bgImage = prev.bgImage;
    newSlide.fontFamily = prev.fontFamily;
    newSlide.showDevice = prev.showDevice;
    newSlide.deviceScale = prev.deviceScale;
    newSlide.deviceOffsetY = prev.deviceOffsetY;
  }
  
  state.slides.push(newSlide);
  state.activeSlideIndex = state.slides.length - 1;
  triggerUpdate();
}

export function deleteSlide(index: number) {
  if (state.slides.length <= 1) return;
  saveSnapshot();
  
  state.slides.splice(index, 1);
  if (state.activeSlideIndex >= state.slides.length) {
    state.activeSlideIndex = state.slides.length - 1;
  }
  triggerUpdate();
}

export function duplicateSlide(index: number) {
  saveSnapshot();
  const original = state.slides[index];
  const newSlide = JSON.parse(JSON.stringify(original));
  newSlide.id = uid();
  state.slides.splice(index + 1, 0, newSlide);
  state.activeSlideIndex = index + 1;
  triggerUpdate();
}

export function moveSlide(fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= state.slides.length) return;
  saveSnapshot();
  
  const slide = state.slides[fromIndex];
  state.slides.splice(fromIndex, 1);
  state.slides.splice(toIndex, 0, slide);
  state.activeSlideIndex = toIndex;
  triggerUpdate();
}
