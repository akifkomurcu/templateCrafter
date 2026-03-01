import { useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function ScreenshotUpload() {
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const loadScreenshot = useAppStore((s) => s.loadScreenshot);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    loadScreenshot(activeSlideIndex, files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-sans">App Screenshots</h3>
        <span className="text-[10px] text-stone-400 font-mono">Slot {activeSlideIndex + 1}</span>
      </div>
      
      <div
        className="group relative flex flex-col items-center justify-center p-8 bg-white dark:bg-panel-dark border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl cursor-pointer transition-all hover:border-primary/50 hover:bg-sage-50/30 dark:hover:bg-primary/5 shadow-sm overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 mb-3 rounded-full bg-stone-50 dark:bg-stone-800 flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
            <span className="material-symbols-rounded text-2xl">cloud_upload</span>
          </div>
          <span className="text-sm font-bold text-stone-700 dark:text-stone-200 mb-1 leading-tight tracking-tight">Drop screenshot here</span>
          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium opacity-80">or click to browse • PNG, JPG</span>
        </div>
        
        {/* Subtle background glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
