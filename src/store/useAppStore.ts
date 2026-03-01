import { create } from 'zustand';
import type { SlideData, AppState } from '../core/types';
import { uid } from '../core/utils';
import { TEMPLATE_COLORS } from '../core/config';

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
    stickers: [],
  };
}

// ============================================================
// SNAPSHOT FIELDS
// ============================================================
const MAX_HISTORY = 50;

type SnapshotData = Pick<
  AppState,
  'slides' | 'activeSlideIndex' | 'devicePreset' | 'deviceColor' | 'showNotch' | 'selectedStickerId'
>;

function serializeSnapshot(s: AppStoreState): string {
  return JSON.stringify({
    slides: s.slides,
    activeSlideIndex: s.activeSlideIndex,
    devicePreset: s.devicePreset,
    deviceColor: s.deviceColor,
    showNotch: s.showNotch,
    selectedStickerId: s.selectedStickerId,
  } satisfies SnapshotData);
}

// ============================================================
// STORE TYPE
// ============================================================
export interface AppStoreState {
  // Document fields (snapshotted)
  slides: SlideData[];
  activeSlideIndex: number;
  devicePreset: string;
  deviceColor: string;
  showNotch: boolean;
  selectedStickerId: string | null;

  // Ephemeral fields (not snapshotted)
  activePanel: string | null;
  draggingStickerId: string | null;
  draggingElement: { slideIndex: number; type: 'title' | 'subtitle' | 'device' } | null;
  dragStartX: number;
  dragStartY: number;
  initialStickerX: number;
  initialStickerY: number;
  canvasScale: number;
  canvasPanX: number;
  canvasPanY: number;
  snapToCenterX: boolean;
  snapToCenterY: boolean;
  undoStack: string[];
  redoStack: string[];

  // Export modal open state
  exportModalOpen: boolean;

  // Actions
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  moveSlide: (fromIndex: number, toIndex: number) => void;
  setActiveSlide: (index: number) => void;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
  updateActiveSlide: (patch: Partial<SlideData>) => void;

  setDevicePreset: (preset: string) => void;
  setDeviceColor: (color: string) => void;
  setShowNotch: (show: boolean) => void;
  setActivePanel: (panel: string | null) => void;

  setCanvasScale: (scale: number) => void;
  setCanvasPan: (x: number, y: number) => void;
  resetViewport: () => void;

  setDraggingElement: (el: AppStoreState['draggingElement'], startX: number, startY: number) => void;
  clearDraggingElement: () => void;
  setSnapGuides: (x: boolean, y: boolean) => void;

  setDraggingSticker: (id: string | null, startX?: number, startY?: number, initX?: number, initY?: number) => void;
  setSelectedSticker: (id: string | null) => void;
  addSticker: (emoji: string) => void;
  updateSticker: (slideIndex: number, stickerId: string, patch: { x?: number; y?: number; size?: number }) => void;
  deleteSticker: (stickerId: string) => void;

  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  loadScreenshot: (slideIndex: number, file: File) => void;
  setExportModalOpen: (open: boolean) => void;
}

// ============================================================
// STORE
// ============================================================
const initialSlide = createDefaultSlide();

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Initial state
  slides: [initialSlide],
  activeSlideIndex: 0,
  devicePreset: 'iphone-6.5',
  deviceColor: 'black',
  showNotch: true,
  selectedStickerId: null,

  activePanel: null,
  draggingStickerId: null,
  draggingElement: null,
  dragStartX: 0,
  dragStartY: 0,
  initialStickerX: 0,
  initialStickerY: 0,
  canvasScale: 1,
  canvasPanX: 0,
  canvasPanY: 0,
  snapToCenterX: false,
  snapToCenterY: false,
  undoStack: [],
  redoStack: [],
  exportModalOpen: false,

  // ──────────────────────────────────────────────────────────
  // Slide management
  // ──────────────────────────────────────────────────────────
  addSlide: () => {
    get().saveSnapshot();
    set((s) => {
      const newSlide = createDefaultSlide();
      if (s.slides.length > 0) {
        const prev = s.slides[s.slides.length - 1];
        newSlide.bgType = prev.bgType;
        newSlide.bgColor = prev.bgColor;
        newSlide.bgGradient = prev.bgGradient;
        newSlide.bgImage = prev.bgImage;
        newSlide.fontFamily = prev.fontFamily;
        newSlide.showDevice = prev.showDevice;
        newSlide.deviceScale = prev.deviceScale;
        newSlide.deviceOffsetY = prev.deviceOffsetY;
      }
      return {
        slides: [...s.slides, newSlide],
        activeSlideIndex: s.slides.length,
      };
    });
  },

  deleteSlide: (index) => {
    const { slides } = get();
    if (slides.length <= 1) return;
    get().saveSnapshot();
    set((s) => {
      const newSlides = s.slides.filter((_, i) => i !== index);
      const newActive = s.activeSlideIndex >= newSlides.length
        ? newSlides.length - 1
        : s.activeSlideIndex;
      return { slides: newSlides, activeSlideIndex: newActive };
    });
  },

  duplicateSlide: (index) => {
    get().saveSnapshot();
    set((s) => {
      const original = s.slides[index];
      const newSlide = { ...JSON.parse(JSON.stringify(original)), id: uid() };
      const newSlides = [...s.slides];
      newSlides.splice(index + 1, 0, newSlide);
      return { slides: newSlides, activeSlideIndex: index + 1 };
    });
  },

  moveSlide: (fromIndex, toIndex) => {
    const { slides } = get();
    if (toIndex < 0 || toIndex >= slides.length) return;
    get().saveSnapshot();
    set((s) => {
      const newSlides = [...s.slides];
      const [slide] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, slide);
      return { slides: newSlides, activeSlideIndex: toIndex };
    });
  },

  setActiveSlide: (index) => set({ activeSlideIndex: index }),

  updateSlide: (index, patch) =>
    set((s) => {
      const newSlides = [...s.slides];
      newSlides[index] = { ...newSlides[index], ...patch };
      return { slides: newSlides };
    }),

  updateActiveSlide: (patch) => {
    const { activeSlideIndex, updateSlide } = get();
    updateSlide(activeSlideIndex, patch);
  },

  // ──────────────────────────────────────────────────────────
  // Device / global settings
  // ──────────────────────────────────────────────────────────
  setDevicePreset: (preset) => set({ devicePreset: preset }),
  setDeviceColor: (color) => set({ deviceColor: color }),
  setShowNotch: (show) => set({ showNotch: show }),
  setActivePanel: (panel) => set({ activePanel: panel }),

  // ──────────────────────────────────────────────────────────
  // Viewport
  // ──────────────────────────────────────────────────────────
  setCanvasScale: (scale) => set({ canvasScale: Math.min(Math.max(0.1, scale), 5) }),
  setCanvasPan: (x, y) => set({ canvasPanX: x, canvasPanY: y }),
  resetViewport: () => set({ canvasScale: 1, canvasPanX: 0, canvasPanY: 0 }),

  // ──────────────────────────────────────────────────────────
  // Dragging elements (title / subtitle / device)
  // ──────────────────────────────────────────────────────────
  setDraggingElement: (el, startX, startY) =>
    set({ draggingElement: el, dragStartX: startX, dragStartY: startY }),

  clearDraggingElement: () =>
    set({ draggingElement: null, snapToCenterX: false, snapToCenterY: false }),

  setSnapGuides: (x, y) => set({ snapToCenterX: x, snapToCenterY: y }),

  // ──────────────────────────────────────────────────────────
  // Stickers
  // ──────────────────────────────────────────────────────────
  setDraggingSticker: (id, startX, startY, initX, initY) =>
    set({
      draggingStickerId: id,
      ...(startX !== undefined ? { dragStartX: startX } : {}),
      ...(startY !== undefined ? { dragStartY: startY } : {}),
      ...(initX !== undefined ? { initialStickerX: initX } : {}),
      ...(initY !== undefined ? { initialStickerY: initY } : {}),
    }),

  setSelectedSticker: (id) => set({ selectedStickerId: id }),

  addSticker: (emoji) => {
    get().saveSnapshot();
    set((s) => {
      const newSlides = [...s.slides];
      const slide = { ...newSlides[s.activeSlideIndex] };
      slide.stickers = [
        ...slide.stickers,
        { id: uid(), content: emoji, x: 500, y: 500, size: 100 },
      ];
      newSlides[s.activeSlideIndex] = slide;
      return { slides: newSlides };
    });
  },

  updateSticker: (slideIndex, stickerId, patch) =>
    set((s) => {
      const newSlides = [...s.slides];
      const slide = { ...newSlides[slideIndex] };
      slide.stickers = slide.stickers.map((st) =>
        st.id === stickerId ? { ...st, ...patch } : st
      );
      newSlides[slideIndex] = slide;
      return { slides: newSlides };
    }),

  deleteSticker: (stickerId) =>
    set((s) => {
      const newSlides = [...s.slides];
      const slide = { ...newSlides[s.activeSlideIndex] };
      slide.stickers = slide.stickers.filter((st) => st.id !== stickerId);
      newSlides[s.activeSlideIndex] = slide;
      return { slides: newSlides, selectedStickerId: null };
    }),

  // ──────────────────────────────────────────────────────────
  // History
  // ──────────────────────────────────────────────────────────
  saveSnapshot: () => {
    const s = get();
    const snapshot = serializeSnapshot(s);
    if (s.undoStack.length > 0 && s.undoStack[s.undoStack.length - 1] === snapshot) return;
    const newStack = [...s.undoStack, snapshot];
    if (newStack.length > MAX_HISTORY) newStack.shift();
    set({ undoStack: newStack, redoStack: [] });
  },

  undo: () => {
    const s = get();
    if (s.undoStack.length === 0) return;
    const currentSnapshot = serializeSnapshot(s);
    const snapshot = s.undoStack[s.undoStack.length - 1];
    const data: SnapshotData = JSON.parse(snapshot);
    set({
      ...data,
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, currentSnapshot],
    });
  },

  redo: () => {
    const s = get();
    if (s.redoStack.length === 0) return;
    const currentSnapshot = serializeSnapshot(s);
    const snapshot = s.redoStack[s.redoStack.length - 1];
    const data: SnapshotData = JSON.parse(snapshot);
    set({
      ...data,
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, currentSnapshot],
    });
  },

  // ──────────────────────────────────────────────────────────
  // Screenshot loading
  // ──────────────────────────────────────────────────────────
  loadScreenshot: (slideIndex, file) => {
    get().saveSnapshot();
    const url = URL.createObjectURL(file);
    get().updateSlide(slideIndex, {
      screenshotSrc: url,
      showDevice: true,
      layoutType: 'text-device',
    });
  },

  // ──────────────────────────────────────────────────────────
  // Export modal
  // ──────────────────────────────────────────────────────────
  setExportModalOpen: (open) => set({ exportModalOpen: open }),
}));
