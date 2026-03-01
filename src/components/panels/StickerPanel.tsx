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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-3">
        {STICKER_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="aspect-square bg-white dark:bg-panel-dark hover:bg-sage-100 dark:hover:bg-stone-700 border border-border-light dark:border-stone-600 rounded-lg flex items-center justify-center text-xl transition-all shadow-sm transform hover:scale-105"
            onClick={() => addSticker(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      {selectedSticker && (
        <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-border-light dark:border-border-dark shadow-inner">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Selected Asset</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Size</label>
                <span className="text-xs font-mono text-primary font-bold">{selectedSticker.size}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={300}
                value={selectedSticker.size}
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-primary"
                onChange={(e) =>
                  updateSticker(activeSlideIndex, selectedSticker.id, {
                    size: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <button
              className="w-full py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
              onClick={() => deleteSticker(selectedSticker.id)}
            >
              <span className="material-icons-round text-sm">delete</span>
              Remove Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
