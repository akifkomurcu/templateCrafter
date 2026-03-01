import { useAppStore } from '../../store/useAppStore';
import { STICKER_EMOJIS } from '../../core/config';

export function StickerPanel() {
  const slides = useAppStore((s) => s.slides);
  const activeSlideIndex = useAppStore((s) => s.activeSlideIndex);
  const selectedStickerId = useAppStore((s) => s.selectedStickerId);
  const addSticker = useAppStore((s) => s.addSticker);
  const updateSticker = useAppStore((s) => s.updateSticker);
  const deleteSticker = useAppStore((s) => s.deleteSticker);

  const slide = slides[activeSlideIndex];
  if (!slide) return null;

  const selectedSticker = selectedStickerId
    ? slide.stickers?.find((s) => s.id === selectedStickerId)
    : null;

  return (
    <div className="properties-panel__content">
      <div className="panel-section">
        <div className="panel-section__title">Add Sticker</div>
        <div className="sticker-grid">
          {STICKER_EMOJIS.map((emoji) => (
            <div
              key={emoji}
              className="sticker-item"
              data-emoji={emoji}
              onClick={() => addSticker(emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {selectedSticker && (
        <div className="panel-section">
          <div className="panel-section__title">Selected Sticker</div>
          <div className="panel-field">
            <label>Size</label>
            <div className="range-row">
              <input
                type="range"
                min={20}
                max={300}
                value={selectedSticker.size}
                id="sticker-size"
                onChange={(e) =>
                  updateSticker(activeSlideIndex, selectedSticker.id, {
                    size: parseInt(e.target.value),
                  })
                }
              />
              <span className="range-value">{selectedSticker.size}px</span>
            </div>
          </div>
          <button
            className="btn-danger w-full mt-4"
            id="delete-sticker"
            onClick={() => deleteSticker(selectedSticker.id)}
          >
            Delete Sticker
          </button>
        </div>
      )}
    </div>
  );
}
