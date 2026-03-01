import { useAppStore } from '../../store/useAppStore';

export function UndoRedo() {
  const undoStack = useAppStore((s) => s.undoStack);
  const redoStack = useAppStore((s) => s.redoStack);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return (
    <div className="sidebar-section">
      <div className="sidebar-section__row" style={{ gap: 'var(--sp-2)' }}>
        <button
          className="sidebar-action-btn"
          id="btn-undo"
          disabled={!canUndo}
          style={{ opacity: canUndo ? 1 : 0.3 }}
          onClick={undo}
        >
          <span className="material-symbols-rounded">undo</span> Undo
        </button>
        <button
          className="sidebar-action-btn"
          id="btn-redo"
          disabled={!canRedo}
          style={{ opacity: canRedo ? 1 : 0.3 }}
          onClick={redo}
        >
          <span className="material-symbols-rounded">redo</span> Redo
        </button>
      </div>
    </div>
  );
}
