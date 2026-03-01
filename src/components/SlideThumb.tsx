import { useRef, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DEVICE_PRESETS } from '../core/config';
import { SlideCanvas } from './SlideCanvas';

interface SlideThumbProps {
  index: number;
}

export function SlideThumb({ index }: SlideThumbProps) {
  const thumbCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const slides = useAppStore((s) => s.slides);
  const devicePreset = useAppStore((s) => s.devicePreset);
  const setActiveSlide = useAppStore((s) => s.setActiveSlide);
  const deleteSlide = useAppStore((s) => s.deleteSlide);
  const duplicateSlide = useAppStore((s) => s.duplicateSlide);
  const moveSlide = useAppStore((s) => s.moveSlide);

  const [dragOver, setDragOver] = useState<'left' | 'right' | null>(null);

  const isActive = index === activeSlideIndex;
  const preset = DEVICE_PRESETS[devicePreset];
  const thumbH = 100;
  const thumbW = Math.round(thumbH * (preset.width / preset.height));

  const handleDrawn = useCallback(
    (_idx: number, srcCanvas: HTMLCanvasElement) => {
      const thumb = thumbCanvasRef.current;
      if (!thumb) return;
      const thumbCtx = thumb.getContext('2d');
      if (!thumbCtx) return;
      thumbCtx.clearRect(0, 0, thumb.width, thumb.height);
      thumbCtx.drawImage(srcCanvas, 0, 0, thumb.width, thumb.height);
    },
    []
  );

  // Drag-to-reorder handlers
  const dragIndexRef = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    setDragOver(e.clientX < mid ? 'left' : 'right');
  };

  const handleDragLeave = () => setDragOver(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);

    // Read from dataTransfer since dragIndexRef might belong to another thumb
    const fromStr = e.dataTransfer.getData('text/plain');
    const fromIndex = parseInt(fromStr);
    if (isNaN(fromIndex) || fromIndex === index) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    let toIndex = index;
    if (e.clientX >= mid) toIndex = index + 1;
    if (fromIndex < toIndex) toIndex -= 1;
    moveSlide(fromIndex, toIndex);
  };

  return (
    <div
      className={`slide-thumb${isActive ? ' active' : ''}${dragOver === 'left' ? ' drag-over-left' : ''}${dragOver === 'right' ? ' drag-over-right' : ''}`}
      data-slide-index={index}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(index));
        handleDragStart(e);
      }}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => setActiveSlide(index)}
    >
      {/* Hidden full-res canvas drives thumbnail via onDrawn */}
      <div style={{ display: 'none' }}>
        <SlideCanvas slideIndex={index} onDrawn={handleDrawn} />
      </div>

      <canvas ref={thumbCanvasRef} width={thumbW} height={thumbH} />

      <div className="slide-thumb__actions">
        {slides.length > 1 && (
          <button
            className="action-dot action-dot--delete"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        )}
        <button
          className="action-dot action-dot--duplicate"
          title="Duplicate"
          onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}
        >
          <span className="material-symbols-rounded">content_copy</span>
        </button>
        {index > 0 && (
          <button
            className="action-dot action-dot--move-left"
            title="Move Left"
            onClick={(e) => { e.stopPropagation(); moveSlide(index, index - 1); }}
          >
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
        )}
        {index < slides.length - 1 && (
          <button
            className="action-dot action-dot--move-right"
            title="Move Right"
            onClick={(e) => { e.stopPropagation(); moveSlide(index, index + 1); }}
          >
            <span className="material-symbols-rounded">chevron_right</span>
          </button>
        )}
      </div>
    </div>
  );
}
