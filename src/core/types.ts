export interface SlideData {
  id: string;
  title: string;
  titleColor: string;
  titleSize: number;
  titleAlign: CanvasTextAlign;
  
  subtitle: string;
  subtitleColor: string;
  subtitleSize: number;
  
  bgType: 'solid' | 'gradient' | 'image';
  bgColor: string;
  bgGradient: string;
  bgImage: string | null;
  
  screenshotSrc: string | null;
  layoutType: 'blank' | 'device-only' | 'text-device' | 'text-only';
  
  showDevice: boolean;
  deviceOffsetY: number;
  deviceScale: number;
  
  fontFamily: string;
  stickers: StickerData[];
}

export interface StickerData {
  id: string;
  content: string; // emoji or potentially image url
  x: number;
  y: number;
  size: number;
}

export interface AppState {
  slides: SlideData[];
  activeSlideIndex: number;
  devicePreset: string;
  deviceColor: string;
  showNotch: boolean;
  activePanel: string | null; // 'text', 'background', 'device', 'stickers'
  selectedStickerId: string | null;
  draggingStickerId: string | null;
  dragStartX: number;
  dragStartY: number;
  initialStickerX: number;
  initialStickerY: number;
  
  // Canvas View
  canvasScale: number;
  canvasPanX: number;
  canvasPanY: number;
  
  // History
  undoStack: string[];
  redoStack: string[];
}

export interface DevicePreset {
  label: string;
  width: number;
  height: number;
  category: 'iphone' | 'ipad' | 'android';
}
