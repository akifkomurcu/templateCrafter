import type { DevicePreset } from '../core/types';

export function drawGuides(
  ctx: CanvasRenderingContext2D,
  preset: DevicePreset,
  slideIndex: number,
  snapToCenterX: boolean,
  snapToCenterY: boolean,
  draggingElementSlideIndex: number | null
): void {
  if (!snapToCenterX && !snapToCenterY) return;
  if (draggingElementSlideIndex === null || draggingElementSlideIndex !== slideIndex) return;

  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);

  const centerX = preset.width / 2;
  const centerY = preset.height / 2;

  if (snapToCenterX) {
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, preset.height);
    ctx.stroke();
  }

  if (snapToCenterY) {
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(preset.width, centerY);
    ctx.stroke();
  }

  ctx.restore();
}
