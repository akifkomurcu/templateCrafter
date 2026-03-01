import { useAppStore } from '../store/useAppStore';
import { SlideThumb } from './SlideThumb';

export function SlideStrip() {
  const slides = useAppStore((s) => s.slides);
  const addSlide = useAppStore((s) => s.addSlide);

  return (
    <div className="screenshot-strip" id="screenshot-strip">
      <div className="screenshot-strip__list" id="slide-list">
        {slides.map((_, index) => (
          <SlideThumb key={index} index={index} />
        ))}
      </div>
      <button
        className="screenshot-strip__add"
        id="btn-add-slide"
        title="Add Screenshot"
        onClick={addSlide}
      >
        <span className="material-symbols-rounded">add</span>
        <span>Add</span>
      </button>
    </div>
  );
}
