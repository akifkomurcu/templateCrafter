import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      const inInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

      const { undo, redo, duplicateSlide, deleteSlide, setActiveSlide,
              setExportModalOpen, slides, activeSlideIndex } = useAppStore.getState();

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      // Export
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        duplicateSlide(activeSlideIndex);
        return;
      }

      if (inInput) return;

      // Delete slide
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSlide(activeSlideIndex);
        return;
      }

      // Navigate slides
      if (e.key === 'ArrowLeft' && activeSlideIndex > 0) {
        setActiveSlide(activeSlideIndex - 1);
      }
      if (e.key === 'ArrowRight' && activeSlideIndex < slides.length - 1) {
        setActiveSlide(activeSlideIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
