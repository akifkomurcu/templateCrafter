import type { SlideData } from '../core/types';
import type { DevicePreset } from '../core/types';
import type { HitRegions } from './types';
import { drawBackground } from './drawBackground';
import { drawText } from './drawText';
import { drawDeviceFrame } from './drawDeviceFrame';
import { drawStickers } from './drawStickers';
import { drawGuides } from './drawGuides';

export function drawSlideContent(
  ctx: CanvasRenderingContext2D,
  slide: SlideData,
  preset: DevicePreset,
  devicePresetKey: string,
  deviceColor: string,
  showNotch: boolean,
  slideIndex: number,
  totalSlides: number,
  snapToCenterX: boolean,
  snapToCenterY: boolean,
  draggingElementSlideIndex: number | null,
  onImageLoad: () => void
): HitRegions {
  ctx.clearRect(0, 0, preset.width, preset.height);

  drawBackground(ctx, slide, preset, slideIndex, totalSlides, onImageLoad);

  const regions: HitRegions = {};

  if (slide.layoutType !== 'blank' && slide.layoutType !== 'device-only') {
    const textRegions = drawText(ctx, slide, preset);
    regions.title = textRegions.title;
    regions.subtitle = textRegions.subtitle;
  }

  if (slide.showDevice && slide.layoutType !== 'blank' && slide.layoutType !== 'text-only') {
    regions.device = drawDeviceFrame(
      ctx, slide, preset, devicePresetKey, deviceColor, showNotch, onImageLoad
    );
  }

  if (slide.stickers?.length) {
    drawStickers(ctx, slide);
  }

  drawGuides(ctx, preset, slideIndex, snapToCenterX, snapToCenterY, draggingElementSlideIndex);

  return regions;
}
