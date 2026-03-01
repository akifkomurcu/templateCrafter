import { useAppStore } from '../../store/useAppStore';

export function UndoRedo() {
  const undoStack = useAppStore((s) => s.undoStack);
  const redoStack = useAppStore((s) => s.redoStack);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return (
    <>
      <button
        className={`flex items-center justify-center gap-2 py-2 bg-white dark:bg-panel-dark hover:bg-sage-100 dark:hover:bg-stone-700 border border-border-light dark:border-stone-600 rounded text-stone-600 dark:text-stone-300 text-xs font-medium transition-colors shadow-sm ${!canUndo ? 'opacity-40 cursor-not-allowed' : ''}`}
        id="btn-undo"
        disabled={!canUndo}
        onClick={undo}
      >
        <span className="material-icons-round text-sm">undo</span> Undo
      </button>
      <button
        className={`flex items-center justify-center gap-2 py-2 bg-white dark:bg-panel-dark hover:bg-sage-100 dark:hover:bg-stone-700 border border-border-light dark:border-stone-600 rounded text-stone-600 dark:text-stone-300 text-xs font-medium transition-colors shadow-sm ${!canRedo ? 'opacity-40 cursor-not-allowed' : ''}`}
        id="btn-redo"
        disabled={!canRedo}
        onClick={redo}
      >
        <span className="material-icons-round text-sm">redo</span> Redo
      </button>
    </>
  );
}
