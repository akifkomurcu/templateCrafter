import type { SlideData } from '../core/types';
import type { DevicePreset } from '../core/types';
import type { HitBox } from './types';
import { roundRect } from '../core/utils';
import { screenshotCache } from './screenshotCache';
import { DEVICE_PRESETS } from '../core/config';

export function drawDeviceFrame(
  ctx: CanvasRenderingContext2D,
  slide: SlideData,
  preset: DevicePreset,
  devicePresetKey: string,
  deviceColor: string,
  showNotch: boolean,
  onImageLoad: () => void
): HitBox {
  const category = DEVICE_PRESETS[devicePresetKey].category;

  const deviceW = preset.width * (slide.deviceScale / 100);
  const deviceH = deviceW * (category === 'ipad' ? 1.35 : 2.05);

  const defaultDeviceX = (preset.width - deviceW) / 2;
  const defaultDeviceY = preset.height * (slide.deviceOffsetY / 100);

  const deviceX = slide.devicePos ? slide.devicePos.x : defaultDeviceX;
  const deviceY = slide.devicePos ? slide.devicePos.y : defaultDeviceY;

  const hitBox: HitBox = { x: deviceX, y: deviceY, w: deviceW, h: deviceH };

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
  ctx.fillStyle = frameColors[deviceColor] ?? '#1a1a1a';
  roundRect(ctx, deviceX, deviceY, deviceW, deviceH, radius);
  ctx.fill();
  ctx.restore();

  const screenX = deviceX + bezelW;
  const screenY = deviceY + bezelW;
  const screenW = deviceW - bezelW * 2;
  const screenH = deviceH - bezelW * 2;
  const screenRadius = radius * 0.85;

  if (slide.screenshotSrc) {
    if (screenshotCache.has(slide.screenshotSrc)) {
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
      // Load and cache
      const img = new Image();
      img.onload = () => {
        screenshotCache.set(slide.screenshotSrc!, img);
        onImageLoad();
      };
      img.src = slide.screenshotSrc;

      // Draw empty screen while loading
      ctx.fillStyle = '#2a2a3e';
      roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#2a2a3e';
    roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${screenW * 0.15}px "Material Symbols Rounded"`;
    ctx.fillText('image', screenX + screenW / 2, screenY + screenH / 2);
  }

  // Notch
  if (category === 'iphone' && showNotch) {
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
  roundRect(
    ctx,
    deviceX + (deviceW - indicatorW) / 2,
    deviceY + deviceH - bezelW - 20,
    indicatorW,
    indicatorH,
    indicatorH / 2
  );
  ctx.fill();

  return hitBox;
}
