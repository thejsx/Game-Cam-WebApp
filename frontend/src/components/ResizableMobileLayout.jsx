import { useEffect, useRef, useState } from 'react';


const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function ResizableMobileLayout({
  top,
  bottom,
  minTopPct = 20,
  maxTopPct = 85,
  storageKey = 'gcw.splitTop'
}) {
  const containerRef = useRef(null);
  const [topPct, setTopPct] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? Number(saved) : 62; // sensible default
  });


  useEffect(() => {
    sessionStorage.setItem(storageKey, String(topPct));
  }, [topPct]);

  // Help Leaflet re-measure when orientation changes
  useEffect(() => {
    const onOrientation = () => window.dispatchEvent(new Event('resize'));
    window.addEventListener('orientationchange', onOrientation);
    return () => window.removeEventListener('orientationchange', onOrientation);
  }, []);

  const dragging = useRef(false);
  const startY = useRef(0);
  const startTop = useRef(0);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging.current = true;
    startY.current = e.clientY;
    startTop.current = topPct;
    containerRef.current?.setPointerCapture?.(e.pointerId);
    document.body.style.userSelect = 'none';
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dy = e.clientY - startY.current;
    const pctDelta = (dy / rect.height) * 100;
    setTopPct(clamp(startTop.current + pctDelta, minTopPct, maxTopPct));
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.userSelect = '';
    // Nudge listeners (MapPane should invalidateSize on resize)
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div
      ref={containerRef}
      className="rm-layout"
      style={{ '--top-pane': `${topPct}%` }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="rm-top" aria-label="Map pane">{top}</div>
      <div
        className="rm-handle"
        role="separator"
        aria-orientation="horizontal"
        tabIndex={0}
        onPointerDown={onPointerDown}
        aria-label="Drag to resize map vs. lists"
      >
        <div className="rm-grip" />
      </div>
      <div className="rm-bottom" aria-label="Filters and videos">{bottom}</div>
    </div>
  );
}
