import { useAppStore } from '../store/useAppStore';

export function ZoomIndicator() {
  const canvasScale = useAppStore((s) => s.canvasScale);
  const resetViewport = useAppStore((s) => s.resetViewport);

  return (
    <div id="canvas-zoom-indicator" onClick={resetViewport} style={{ cursor: 'pointer' }}>
      {Math.round(canvasScale * 100)}%
    </div>
  );
}
