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
    <div className="sidebar-section">
      <div className="sidebar-section__title">App Screenshots</div>
      <div
        className="drop-zone"
        id="screenshot-drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="material-symbols-rounded">cloud_upload</span>
        <span className="drop-zone__label">Drop screenshot here</span>
        <span className="drop-zone__hint">or click to browse • PNG, JPG</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
