
// ============================================================
// DOM HELPERS
// ============================================================
export const $ = (selector: string) => document.querySelector(selector);
export const $$ = (selector: string) => document.querySelectorAll(selector);

// ============================================================
// ID GENERATOR
// ============================================================
export function uid(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ============================================================
// CANVAS HELPERS
// ============================================================
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = getWrappedLines(ctx, text, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
}

export function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ============================================================
// GRADIENT PARSERS
// ============================================================
export function parseGradientColors(gradientStr: string): Array<{color: string, pos: number}> {
  const colorRegex = /(#[0-9a-fA-F]{6}|rgba?\([^)]+\))\s+(\d+)%/g;
  const stops: Array<{color: string, pos: number}> = [];
  let match;
  while ((match = colorRegex.exec(gradientStr)) !== null) {
    stops.push({ color: match[1], pos: parseInt(match[2]) / 100 });
  }
  if (stops.length === 0) {
    stops.push({ color: '#667eea', pos: 0 }, { color: '#764ba2', pos: 1 });
  }
  return stops;
}

export function parseGradientAngle(gradientStr: string): number {
  const angleMatch = gradientStr.match(/(\d+)deg/);
  if (angleMatch) return parseInt(angleMatch[1]);
  if (gradientStr.includes('to bottom')) return 180;
  if (gradientStr.includes('to right')) return 90;
  return 135;
}
