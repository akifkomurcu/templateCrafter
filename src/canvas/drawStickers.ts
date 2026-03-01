import type { SlideData } from '../core/types';

export function drawStickers(ctx: CanvasRenderingContext2D, slide: SlideData): void {
  if (!slide.stickers?.length) return;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';

  slide.stickers.forEach((sticker) => {
    ctx.font = `${sticker.size}px "Material Symbols Rounded", "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.fillText(sticker.content, sticker.x, sticker.y);
  });

  ctx.restore();
}
