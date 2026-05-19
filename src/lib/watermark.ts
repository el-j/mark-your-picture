// ── Watermark rendering ─────────────────────────────────────────────────────

import type { RenderOptions, WatermarkPosition } from './types';

export function renderWatermark(
  canvas: HTMLCanvasElement,
  sourceImage: HTMLImageElement,
  opts: RenderOptions,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;
  ctx.drawImage(sourceImage, 0, 0);

  const { watermark, position, opacity, rotation, margin, freeX, freeY } = opts;
  const rad = (rotation * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = opacity / 100;

  if (watermark.type === 'text') {
    const { text, font, size, style, color } = watermark;
    if (!text) {
      ctx.restore();
      return;
    }

    ctx.font = `${style} ${size}px ${font}`.trim();
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(text);
    const tw = metrics.width;
    const th = size;

    if (position === 'tile') {
      drawTiled(ctx, canvas.width, canvas.height, tw, th, rad, (cx, cy) => {
        ctx.fillText(text, cx, cy);
      });
    } else {
      const [px, py] = corner(position, canvas.width, canvas.height, tw, th, margin, freeX, freeY);
      ctx.save();
      ctx.translate(px + tw / 2, py + th / 2);
      ctx.rotate(rad);
      ctx.fillText(text, -tw / 2, 0);
      ctx.restore();
    }
  } else {
    const { image, scale } = watermark;
    const iw = image.naturalWidth * (scale / 100);
    const ih = image.naturalHeight * (scale / 100);

    if (position === 'tile') {
      drawTiled(ctx, canvas.width, canvas.height, iw, ih, rad, (cx, cy) => {
        ctx.drawImage(image, cx - iw / 2, cy - ih / 2, iw, ih);
      });
    } else {
      const [px, py] = corner(position, canvas.width, canvas.height, iw, ih, margin, freeX, freeY);
      ctx.save();
      ctx.translate(px + iw / 2, py + ih / 2);
      ctx.rotate(rad);
      ctx.drawImage(image, -iw / 2, -ih / 2, iw, ih);
      ctx.restore();
    }
  }

  ctx.restore();

  if (position !== 'free') return;

  let ww = 0;
  let wh = 0;
  if (watermark.type === 'text') {
    if (!watermark.text) return;
    ctx.save();
    ctx.font = `${watermark.style} ${watermark.size}px ${watermark.font}`.trim();
    ww = ctx.measureText(watermark.text).width;
    wh = watermark.size;
    ctx.restore();
  } else {
    ww = watermark.image.naturalWidth * (watermark.scale / 100);
    wh = watermark.image.naturalHeight * (watermark.scale / 100);
  }

  const [px, py] = corner(position, canvas.width, canvas.height, ww, wh, margin, freeX, freeY);
  const cx = px + ww / 2;
  const cy = py + wh / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);
  ctx.lineWidth = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / 500));
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeRect(-ww / 2, -wh / 2, ww, wh);
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(12, 16, 30, 0.9)';
  ctx.lineWidth = Math.max(1, ctx.lineWidth - 1);
  ctx.strokeRect(-ww / 2, -wh / 2, ww, wh);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(2, Math.min(ww, wh) * 0.03), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTiled(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  tw: number,
  th: number,
  rad: number,
  draw: (cx: number, cy: number) => void,
): void {
  const padX = tw * 2;
  const padY = th * 2;
  for (let y = -th; y < ch + padY; y += padY) {
    for (let x = -tw; x < cw + padX; x += padX) {
      ctx.save();
      ctx.translate(x + tw / 2, y + th / 2);
      ctx.rotate(rad);
      draw(0, 0);
      ctx.restore();
    }
  }
}

function corner(
  position: WatermarkPosition,
  cw: number,
  ch: number,
  ww: number,
  wh: number,
  margin: number,
  freeX?: number,
  freeY?: number,
): [number, number] {
  switch (position) {
    case 'top-left':
      return [margin, margin];
    case 'top-right':
      return [cw - ww - margin, margin];
    case 'bottom-left':
      return [margin, ch - wh - margin];
    case 'bottom-right':
      return [cw - ww - margin, ch - wh - margin];
    case 'center':
      return [(cw - ww) / 2, (ch - wh) / 2];
    case 'free':
      return [(freeX ?? 0.5) * cw - ww / 2, (freeY ?? 0.5) * ch - wh / 2];
    default:
      return [cw - ww - margin, ch - wh - margin];
  }
}

export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
