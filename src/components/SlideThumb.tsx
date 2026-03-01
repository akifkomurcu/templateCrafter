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
      className={`group relative flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 ${isActive ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'}`}
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
      <div className={`w-16 h-24 rounded-xl border-2 overflow-hidden relative shadow-lg transform transition-all duration-300 ${isActive ? 'border-primary' : 'border-transparent hover:border-stone-300 dark:hover:border-stone-500'}`}>
        {/* Hidden full-res canvas drives thumbnail via onDrawn */}
        <div style={{ display: 'none' }}>
          <SlideCanvas slideIndex={index} onDrawn={handleDrawn} />
        </div>
        <canvas ref={thumbCanvasRef} width={thumbW} height={thumbH} className="w-full h-full object-cover" />
        <div className="absolute inset-x-2 top-3 bottom-0 bg-stone-800 rounded-t-sm opacity-5 pointer-events-none"></div>
      </div>

      <span className={`absolute bottom-0 left-0 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-serif font-bold shadow-sm z-10 transition-colors ${isActive ? 'bg-primary' : 'bg-stone-600'}`}>
        {index + 1}
      </span>

      <div className="absolute -right-2 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {slides.length > 1 && (
          <button
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
          >
            <span className="material-icons-round text-xs">close</span>
          </button>
        )}
        <button
          className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          title="Duplicate"
          onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}
        >
          <span className="material-icons-round text-xs">content_copy</span>
        </button>
      </div>
    </div>
  );
}
