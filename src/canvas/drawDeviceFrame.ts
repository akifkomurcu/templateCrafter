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

  // Bezel as fraction of device width
  const bezelFrac = category === 'ipad' ? 0.015 : 0.022;
  const bezelW = deviceW * bezelFrac;

  // Correct aspect ratio: screen fills interior, so deviceH accounts for bezels
  const screenAspect = preset.height / preset.width;
  const deviceH = deviceW * (screenAspect * (1 - 2 * bezelFrac) + 2 * bezelFrac);

  const defaultDeviceX = (preset.width - deviceW) / 2;
  const defaultDeviceY = preset.height * (slide.deviceOffsetY / 100);

  const deviceX = slide.devicePos ? slide.devicePos.x : defaultDeviceX;
  const deviceY = slide.devicePos ? slide.devicePos.y : defaultDeviceY;

  const hitBox: HitBox = { x: deviceX, y: deviceY, w: deviceW, h: deviceH };

  // Corner radius by device type
  const radius =
    category === 'iphone' ? deviceW * 0.13
    : category === 'ipad'  ? deviceW * 0.05
    :                        deviceW * 0.08; // android

  // Frame palette
  const frameMain =
    deviceColor === 'silver' ? '#c8c8cc'
    : deviceColor === 'gold' ? '#c8a860'
    : '#1c1c1e';

  const frameHighlight =
    deviceColor === 'silver' ? '#e8e8ec'
    : deviceColor === 'gold' ? '#debb78'
    : '#2c2c2e';

  const btnColor =
    deviceColor === 'silver' ? '#a8a8ac'
    : deviceColor === 'gold' ? '#b89850'
    : '#131315';

  // ── Body shadow ─────────────────────────────────────────────
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 80;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = frameMain;
  roundRect(ctx, deviceX, deviceY, deviceW, deviceH, radius);
  ctx.fill();
  ctx.restore();

  // ── Body gradient (subtle depth) ────────────────────────────
  ctx.save();
  const grad = ctx.createLinearGradient(deviceX, deviceY, deviceX + deviceW, deviceY + deviceH);
  grad.addColorStop(0, frameHighlight);
  grad.addColorStop(0.4, frameMain);
  grad.addColorStop(1, frameMain);
  ctx.fillStyle = grad;
  roundRect(ctx, deviceX, deviceY, deviceW, deviceH, radius);
  ctx.fill();
  ctx.restore();

  // ── Side buttons ────────────────────────────────────────────
  const btnThick = deviceW * 0.028;
  const btnR = btnThick / 2;

  ctx.save();
  ctx.fillStyle = btnColor;

  if (category === 'iphone') {
    // Right: power button
    roundRect(ctx, deviceX + deviceW, deviceY + deviceH * 0.27, btnThick, deviceH * 0.11, btnR);
    ctx.fill();
    // Left: mute switch
    roundRect(ctx, deviceX - btnThick, deviceY + deviceH * 0.14, btnThick, deviceH * 0.045, btnR);
    ctx.fill();
    // Left: volume up
    roundRect(ctx, deviceX - btnThick, deviceY + deviceH * 0.21, btnThick, deviceH * 0.075, btnR);
    ctx.fill();
    // Left: volume down
    roundRect(ctx, deviceX - btnThick, deviceY + deviceH * 0.305, btnThick, deviceH * 0.075, btnR);
    ctx.fill();
  } else if (category === 'android') {
    // Right: power button
    roundRect(ctx, deviceX + deviceW, deviceY + deviceH * 0.28, btnThick, deviceH * 0.09, btnR);
    ctx.fill();
    // Right: volume (above power)
    roundRect(ctx, deviceX + deviceW, deviceY + deviceH * 0.175, btnThick, deviceH * 0.085, btnR);
    ctx.fill();
  } else {
    // iPad: power on top-right edge, volume on right
    roundRect(ctx, deviceX + deviceW, deviceY + deviceH * 0.12, btnThick, deviceH * 0.045, btnR);
    ctx.fill();
    roundRect(ctx, deviceX + deviceW, deviceY + deviceH * 0.19, btnThick, deviceH * 0.065, btnR);
    ctx.fill();
    roundRect(ctx, deviceX + deviceW, deviceY + deviceH * 0.27, btnThick, deviceH * 0.065, btnR);
    ctx.fill();
  }
  ctx.restore();

  // ── Screen area ─────────────────────────────────────────────
  const screenX = deviceX + bezelW;
  const screenY = deviceY + bezelW;
  const screenW = deviceW - bezelW * 2;
  const screenH = deviceH - bezelW * 2;
  const screenRadius = radius * 0.88;

  if (slide.screenshotSrc) {
    if (screenshotCache.has(slide.screenshotSrc)) {
      const img = screenshotCache.get(slide.screenshotSrc)!;

      ctx.save();
      roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
      ctx.clip();

      const imgAspect = img.width / img.height;
      const sAspect = screenW / screenH;
      let drawW: number, drawH: number, drawX: number, drawY: number;

      if (imgAspect > sAspect) {
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
      const img = new Image();
      img.onload = () => {
        screenshotCache.set(slide.screenshotSrc!, img);
        onImageLoad();
      };
      img.src = slide.screenshotSrc;

      ctx.fillStyle = '#1a1a2e';
      roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#1a1a2e';
    roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${screenW * 0.15}px "Material Symbols Rounded"`;
    ctx.fillText('image', screenX + screenW / 2, screenY + screenH / 2);
  }

  // ── Device-specific UI elements ─────────────────────────────

  if (category === 'iphone') {
    // Dynamic Island (pill)
    if (showNotch) {
      const diW = deviceW * 0.25;
      const diH = deviceW * 0.058;
      ctx.fillStyle = '#000';
      roundRect(
        ctx,
        deviceX + (deviceW - diW) / 2,
        deviceY + bezelW + deviceW * 0.01,
        diW, diH, diH / 2
      );
      ctx.fill();
    }

    // Home indicator
    const indW = deviceW * 0.34;
    const indH = 5;
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    roundRect(
      ctx,
      deviceX + (deviceW - indW) / 2,
      deviceY + deviceH - bezelW - 18,
      indW, indH, indH / 2
    );
    ctx.fill();

  } else if (category === 'android') {
    // Punch-hole camera (circle)
    const phR = deviceW * 0.024;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
      deviceX + deviceW / 2,
      deviceY + bezelW + phR + deviceW * 0.012,
      phR, 0, Math.PI * 2
    );
    ctx.fill();

  } else if (category === 'ipad') {
    // Face ID pill
    if (showNotch) {
      const fidW = deviceW * 0.1;
      const fidH = deviceW * 0.018;
      ctx.fillStyle = '#000';
      roundRect(
        ctx,
        deviceX + (deviceW - fidW) / 2,
        deviceY + bezelW + deviceW * 0.006,
        fidW, fidH, fidH / 2
      );
      ctx.fill();
    }
  }

  // ── Glossy edge highlight ────────────────────────────────────
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  roundRect(ctx, deviceX + 1.5, deviceY + 1.5, deviceW - 3, deviceH - 3, radius - 1);
  ctx.stroke();
  ctx.restore();

  return hitBox;
}
