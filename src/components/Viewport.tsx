import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DEVICE_PRESETS } from '../core/config';
import { SlideCanvas } from './SlideCanvas';
import type { HitRegions } from '../canvas/types';

export function Viewport() {
  const viewportRef = useRef<HTMLDivElement>(null);

  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const devicePreset = useAppStore((s) => s.devicePreset);
  const canvasScale = useAppStore((s) => s.canvasScale);
  const canvasPanX = useAppStore((s) => s.canvasPanX);
  const canvasPanY = useAppStore((s) => s.canvasPanY);

  const setCanvasScale = useAppStore((s) => s.setCanvasScale);
  const setCanvasPan = useAppStore((s) => s.setCanvasPan);
  const setActiveSlide = useAppStore((s) => s.setActiveSlide);
  const setDraggingElement = useAppStore((s) => s.setDraggingElement);
  const clearDraggingElement = useAppStore((s) => s.clearDraggingElement);
  const setSnapGuides = useAppStore((s) => s.setSnapGuides);
  const updateSlide = useAppStore((s) => s.updateSlide);

  // Sticker interactions (read imperatively)
  const setDraggingSticker = useAppStore((s) => s.setDraggingSticker);

  // Hit regions map shared between canvas draws and pointer events
  const hitRegionsMap = useRef<Map<number, HitRegions>>(new Map());
  const onHitRegionsUpdate = useCallback((index: number, regions: HitRegions) => {
    hitRegionsMap.current.set(index, regions);
  }, []);

  // Pan state stored in refs (no re-render needed)
  const isPanningRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const clampPan = useCallback((x: number, y: number) => {
    const vp = viewportRef.current;
    if (!vp) return { x, y };
    const maxX = vp.clientWidth * 1.5;
    const maxY = vp.clientHeight * 1.5;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // ── Wheel: zoom (ctrl/meta) or pan ──────────────────────
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Check if we're hovering a slide canvas that has a selected sticker
      const target = e.target as HTMLElement;
      const wrapper = target.closest('.slide-canvas-wrapper') as HTMLElement | null;
      const { selectedStickerId, slides: currentSlides, activeSlideIndex: activeIdx } = useAppStore.getState();

      if (wrapper && selectedStickerId) {
        const slideIndex = parseInt(wrapper.dataset.slideIndex ?? '0');
        const slide = currentSlides[slideIndex];
        const sticker = slide?.stickers?.find((s) => s.id === selectedStickerId);
        if (sticker) {
          const delta = e.deltaY > 0 ? -10 : 10;
          useAppStore.getState().updateSticker(slideIndex, selectedStickerId, {
            size: Math.max(20, sticker.size + delta),
          });
          return;
        }
      }

      if (e.ctrlKey || e.metaKey) {
        const { canvasScale: currentScale } = useAppStore.getState();
        setCanvasScale(currentScale - e.deltaY * 0.001);
      } else {
        const { canvasPanX, canvasPanY } = useAppStore.getState();
        const { x, y } = clampPan(canvasPanX - e.deltaX, canvasPanY - e.deltaY);
        setCanvasPan(x, y);
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [setCanvasScale, setCanvasPan, clampPan]);

  useEffect(() => {
    // ── Space key for panning ────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressedRef.current) {
        isSpacePressedRef.current = true;
        if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
        if (!isPanningRef.current && viewportRef.current) {
          viewportRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const wrapper = target.closest('.slide-canvas-wrapper') as HTMLElement | null;
      const isOnSlide = !!wrapper;

      // 1. Pan: middle click, space+left, shift+left, or click on empty viewport
      if (
        e.button === 1 ||
        (e.button === 0 && (isSpacePressedRef.current || e.shiftKey || !isOnSlide))
      ) {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX, y: e.clientY };
        viewport.style.cursor = 'grabbing';
        if (!isOnSlide) e.preventDefault();
        return;
      }

      // 2. Element dragging on a slide canvas
      if (isOnSlide && e.button === 0 && wrapper) {
        const slideIndex = parseInt(wrapper.dataset.slideIndex ?? '0');
        const { slides: currentSlides, activeSlideIndex: currentActive } = useAppStore.getState();

        // Switch active slide
        if (slideIndex !== currentActive) {
          setActiveSlide(slideIndex);
        }

        const cvs = wrapper.querySelector('canvas') as HTMLCanvasElement | null;
        if (!cvs) return;

        const rect = cvs.getBoundingClientRect();
        const scaleX = cvs.width / rect.width;
        const scaleY = cvs.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Sticker hit detection
        const slide = currentSlides[slideIndex];
        if (slide?.stickers?.length) {
          const clickedSticker = [...slide.stickers].reverse().find((s) => {
            const half = s.size / 2;
            return mouseX >= s.x - half && mouseX <= s.x + half &&
                   mouseY >= s.y - half && mouseY <= s.y + half;
          });
          if (clickedSticker) {
            useAppStore.getState().saveSnapshot();
            useAppStore.getState().setSelectedSticker(clickedSticker.id);
            setDraggingSticker(clickedSticker.id, mouseX, mouseY, clickedSticker.x, clickedSticker.y);
            return;
          } else {
            useAppStore.getState().setSelectedSticker(null);
          }
        }

        // Element (title/subtitle/device) hit detection
        const regions = hitRegionsMap.current.get(slideIndex);
        if (regions) {
          const checkHit = (box?: { x: number; y: number; w: number; h: number }) =>
            box &&
            mouseX >= box.x && mouseX <= box.x + box.w &&
            mouseY >= box.y && mouseY <= box.y + box.h;

          if (checkHit(regions.title)) {
            setDraggingElement(
              { slideIndex, type: 'title' },
              mouseX - regions.title!.x,
              mouseY - regions.title!.y
            );
            viewport.style.cursor = 'move';
            return;
          }
          if (checkHit(regions.subtitle)) {
            setDraggingElement(
              { slideIndex, type: 'subtitle' },
              mouseX - regions.subtitle!.x,
              mouseY - regions.subtitle!.y
            );
            viewport.style.cursor = 'move';
            return;
          }
          if (checkHit(regions.device)) {
            setDraggingElement(
              { slideIndex, type: 'device' },
              mouseX - regions.device!.x,
              mouseY - regions.device!.y
            );
            viewport.style.cursor = 'move';
            return;
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Pan
      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        panStartRef.current = { x: e.clientX, y: e.clientY };

        const { canvasPanX, canvasPanY } = useAppStore.getState();
        const { x, y } = clampPan(canvasPanX + dx, canvasPanY + dy);
        setCanvasPan(x, y);
        return;
      }

      // Sticker dragging
      const { draggingStickerId, activeSlideIndex: activeIdx, slides: currentSlides,
              dragStartX, dragStartY, initialStickerX, initialStickerY } = useAppStore.getState();

      if (draggingStickerId) {
        const wrapper = document.querySelector(
          `.slide-canvas-wrapper[data-slide-index="${activeIdx}"]`
        );
        const cvs = wrapper?.querySelector('canvas') as HTMLCanvasElement | null;
        if (cvs) {
          const rect = cvs.getBoundingClientRect();
          const scaleX = cvs.width / rect.width;
          const scaleY = cvs.height / rect.height;
          const mouseX = (e.clientX - rect.left) * scaleX;
          const mouseY = (e.clientY - rect.top) * scaleY;
          const dx = mouseX - dragStartX;
          const dy = mouseY - dragStartY;
          useAppStore.getState().updateSticker(activeIdx, draggingStickerId, {
            x: initialStickerX + dx,
            y: initialStickerY + dy,
          });
        }
        return;
      }

      // Element dragging
      const { draggingElement, dragStartX: dStartX, dragStartY: dStartY } = useAppStore.getState();
      if (!draggingElement) return;

      const { slideIndex, type } = draggingElement;
      const wrapper = document.querySelector(
        `.slide-canvas-wrapper[data-slide-index="${slideIndex}"]`
      );
      const cvs = wrapper?.querySelector('canvas') as HTMLCanvasElement | null;
      if (!cvs) return;

      const rect = cvs.getBoundingClientRect();
      const scaleX = cvs.width / rect.width;
      const scaleY = cvs.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      let newX = mouseX - dStartX;
      let newY = mouseY - dStartY;

      const regions = hitRegionsMap.current.get(slideIndex);
      let w = 0, h = 0;
      if (type === 'title')    { w = regions?.title?.w    ?? 0; h = regions?.title?.h    ?? 0; }
      if (type === 'subtitle') { w = regions?.subtitle?.w ?? 0; h = regions?.subtitle?.h ?? 0; }
      if (type === 'device')   { w = regions?.device?.w   ?? 0; h = regions?.device?.h   ?? 0; }

      newX = Math.max(Math.min(0, cvs.width - w), Math.min(Math.max(0, cvs.width - w), newX));
      newY = Math.max(Math.min(0, cvs.height - h), Math.min(Math.max(0, cvs.height - h), newY));

      // Snap logic
      const centerX = cvs.width / 2;
      const centerY = cvs.height / 2;
      const threshold = 25;
      const elCX = newX + w / 2;
      const elCY = newY + h / 2;
      let snappedX = newX, snappedY = newY;
      let isSnappedX = false, isSnappedY = false;

      if (Math.abs(elCX - centerX) < threshold) { snappedX = centerX - w / 2; isSnappedX = true; }
      if (Math.abs(elCY - centerY) < threshold) { snappedY = centerY - h / 2; isSnappedY = true; }

      setSnapGuides(isSnappedX, isSnappedY);
      newX = snappedX; newY = snappedY;

      const slide = currentSlides[slideIndex];
      if (type === 'title') {
        const align = slide.titleAlign;
        let anchorX = newX;
        if (align === 'center') anchorX = newX + w / 2;
        else if (align === 'right') anchorX = newX + w;
        updateSlide(slideIndex, { titlePos: { x: anchorX, y: newY } });
      } else if (type === 'subtitle') {
        const align = slide.titleAlign;
        let anchorX = newX;
        if (align === 'center') anchorX = newX + w / 2;
        else if (align === 'right') anchorX = newX + w;
        updateSlide(slideIndex, { subtitlePos: { x: anchorX, y: newY } });
      } else if (type === 'device') {
        updateSlide(slideIndex, { devicePos: { x: newX, y: newY } });
      }
    };

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        if (viewportRef.current) {
          viewportRef.current.style.cursor = isSpacePressedRef.current ? 'grab' : 'default';
        }
      }
      const { draggingElement, draggingStickerId } = useAppStore.getState();
      if (draggingElement) {
        clearDraggingElement();
        if (viewportRef.current) viewportRef.current.style.cursor = 'default';
      }
      if (draggingStickerId) {
        setDraggingSticker(null);
      }
    };

    viewport.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      viewport.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    setActiveSlide, setDraggingElement, clearDraggingElement,
    setSnapGuides, updateSlide, setDraggingSticker, setCanvasPan, clampPan,
  ]);

  const preset = DEVICE_PRESETS[devicePreset];
  const baseH = 500;
  const aspectRatio = preset.width / preset.height;
  const displayW = baseH * aspectRatio;

  return (
    <div className="flex-1 flex flex-col relative bg-background-light dark:bg-background-dark canvas-grid overflow-hidden" ref={viewportRef}>
      <div
        className="flex-1 flex items-start justify-start p-24 gap-12 overflow-auto custom-scrollbar"
        id="canvas-transform-root"
        style={{
          transform: `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasScale})`,
          transformOrigin: 'top left', // Better for row expansion
        }}
      >
        <div className="flex items-center gap-12 min-w-max">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`slide-canvas-wrapper relative flex-shrink-0 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden ${
                index === activeSlideIndex
                  ? 'ring-4 ring-primary ring-offset-8 ring-offset-background-light dark:ring-offset-background-dark scale-100'
                  : 'opacity-80 scale-95 grayscale-[20%] hover:grayscale-0 hover:scale-[0.98] hover:opacity-100'
              }`}
              data-slide-index={index}
              style={{ width: displayW, height: baseH }}
            >
              <SlideCanvas
                slideIndex={index}
                onHitRegionsUpdate={onHitRegionsUpdate}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full shadow-lg p-1.5 gap-2 transition-colors duration-200">
        <button 
          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-sage-100 dark:hover:bg-panel-dark rounded-full transition-colors"
          onClick={() => setCanvasScale(canvasScale - 0.1)}
        >
          <span className="material-icons-round text-sm">remove</span>
        </button>
        <span className="px-1 text-xs font-bold text-stone-600 dark:text-stone-300 min-w-[2.5rem] text-center font-mono">
          {Math.round(canvasScale * 100)}%
        </span>
        <button 
          className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-sage-100 dark:hover:bg-panel-dark rounded-full transition-colors"
          onClick={() => setCanvasScale(canvasScale + 0.1)}
        >
          <span className="material-icons-round text-sm">add</span>
        </button>
      </div>
    </div>
  );
}
