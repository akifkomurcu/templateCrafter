import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DEVICE_PRESETS } from '../core/config';
import { drawSlideContent } from '../canvas/drawSlideContent';
import type { HitRegions } from '../canvas/types';

interface SlideCanvasProps {
  slideIndex: number;
  onHitRegionsUpdate?: (index: number, regions: HitRegions) => void;
  /** Called after canvas is drawn so SlideThumb can copy it */
  onDrawn?: (index: number, canvas: HTMLCanvasElement) => void;
}

export function SlideCanvas({ slideIndex, onHitRegionsUpdate, onDrawn }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRegionsRef = useRef<HitRegions>({});

  const slide = useAppStore((s) => s.slides[slideIndex]);
  const devicePreset = useAppStore((s) => s.devicePreset);
  const deviceColor = useAppStore((s) => s.deviceColor);
  const showNotch = useAppStore((s) => s.showNotch);
  const totalSlides = useAppStore((s) => s.slides.length);
  const snapToCenterX = useAppStore((s) => s.snapToCenterX);
  const snapToCenterY = useAppStore((s) => s.snapToCenterY);
  const draggingElement = useAppStore((s) => s.draggingElement);

  // drawTick forces re-draw when async images load
  const [drawTick, setDrawTick] = useState(0);
  const onImageLoad = useCallback(() => setDrawTick((n) => n + 1), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slide) return;

    const preset = DEVICE_PRESETS[devicePreset];
    canvas.width = preset.width;
    canvas.height = preset.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const regions = drawSlideContent(
      ctx,
      slide,
      preset,
      devicePreset,
      deviceColor,
      showNotch,
      slideIndex,
      totalSlides,
      snapToCenterX,
      snapToCenterY,
      draggingElement?.slideIndex ?? null,
      onImageLoad
    );

    hitRegionsRef.current = regions;
    onHitRegionsUpdate?.(slideIndex, regions);

    // Notify parent for thumbnail update (async to let paint flush)
    requestAnimationFrame(() => {
      if (canvasRef.current) onDrawn?.(slideIndex, canvasRef.current);
    });
  }, [
    slide,
    devicePreset,
    deviceColor,
    showNotch,
    totalSlides,
    snapToCenterX,
    snapToCenterY,
    draggingElement,
    drawTick,
    slideIndex,
    onImageLoad,
    onHitRegionsUpdate,
    onDrawn,
  ]);

  const preset = DEVICE_PRESETS[devicePreset];
  const baseH = 500;
  const aspectRatio = preset.width / preset.height;
  const displayW = baseH * aspectRatio;

  return (
    <canvas
      ref={canvasRef}
      style={{ width: displayW, height: baseH, display: 'block' }}
    />
  );
}
