import type { SlideData } from '../core/types';
import type { DevicePreset } from '../core/types';
import { parseGradientColors, parseGradientAngle } from '../core/utils';
import { screenshotCache } from './screenshotCache';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  slide: SlideData,
  preset: DevicePreset,
  slideIndex: number,
  totalSlides: number,
  onImageLoad: () => void
): void {
  if (slide.bgType === 'image' && slide.bgImage) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, preset.width, preset.height);

    if (screenshotCache.has(slide.bgImage)) {
      const img = screenshotCache.get(slide.bgImage)!;

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
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        screenshotCache.set(slide.bgImage!, img);
        onImageLoad();
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
