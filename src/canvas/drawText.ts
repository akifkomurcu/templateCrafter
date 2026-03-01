import type { SlideData } from '../core/types';
import type { DevicePreset } from '../core/types';
import type { HitRegions } from './types';
import { getWrappedLines, wrapText } from '../core/utils';

export function drawText(
  ctx: CanvasRenderingContext2D,
  slide: SlideData,
  preset: DevicePreset
): Pick<HitRegions, 'title' | 'subtitle'> {
  const defaultTitleX =
    slide.titleAlign === 'center' ? preset.width / 2 :
    slide.titleAlign === 'left' ? preset.width * 0.08 :
    preset.width * 0.92;
  const defaultTitleY = preset.height * 0.08;

  const titleX = slide.titlePos ? slide.titlePos.x : defaultTitleX;
  const titleY = slide.titlePos ? slide.titlePos.y : defaultTitleY;

  ctx.textAlign = slide.titleAlign;
  ctx.textBaseline = 'top';
  ctx.font = `800 ${slide.titleSize}px "${slide.fontFamily}", sans-serif`;
  ctx.fillStyle = slide.titleColor;

  const maxW = preset.width * 0.84;
  const titleLines = getWrappedLines(ctx, slide.title, maxW);
  const titleH = titleLines.length * slide.titleSize * 1.2;

  let realMaxW = 0;
  titleLines.forEach((l) => {
    const w = ctx.measureText(l).width;
    if (w > realMaxW) realMaxW = w;
  });

  let boxX = titleX;
  if (slide.titleAlign === 'center') boxX = titleX - realMaxW / 2;
  else if (slide.titleAlign === 'right') boxX = titleX - realMaxW;

  const titleRegion = { x: boxX, y: titleY, w: realMaxW, h: titleH };

  wrapText(ctx, slide.title, titleX, titleY, maxW, slide.titleSize * 1.2);

  // Subtitle
  const defaultSubtitleY = defaultTitleY + titleH + 20;
  const subtitleX = slide.subtitlePos ? slide.subtitlePos.x : defaultTitleX;
  const subtitleY = slide.subtitlePos
    ? slide.subtitlePos.y
    : slide.titlePos
    ? slide.titlePos.y + titleH + 20
    : defaultSubtitleY;

  ctx.font = `400 ${slide.subtitleSize}px "${slide.fontFamily}", sans-serif`;
  ctx.fillStyle = slide.subtitleColor;

  const subtitleLines = getWrappedLines(ctx, slide.subtitle, maxW);
  const subH = subtitleLines.length * slide.subtitleSize * 1.3;

  let subMaxW = 0;
  subtitleLines.forEach((l) => {
    const w = ctx.measureText(l).width;
    if (w > subMaxW) subMaxW = w;
  });

  let subBoxX = subtitleX;
  if (slide.titleAlign === 'center') subBoxX = subtitleX - subMaxW / 2;
  else if (slide.titleAlign === 'right') subBoxX = subtitleX - subMaxW;

  const subtitleRegion = { x: subBoxX, y: subtitleY, w: subMaxW, h: subH };

  wrapText(ctx, slide.subtitle, subtitleX, subtitleY, maxW, slide.subtitleSize * 1.3);

  return { title: titleRegion, subtitle: subtitleRegion };
}
