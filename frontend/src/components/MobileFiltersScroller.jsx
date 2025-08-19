// frontend/src/components/MobileFiltersScroller.jsx
import React, { useLayoutEffect, useRef } from 'react';
import Filters from './Filters';
import useIsMobile from '../useIsMobile';

/**
 * Measures all elements marked with [data-filter-list] inside containerRef
 * and sets --filters-max-item-width to the maximum intrinsic width found.
 * Runs only on mobile. Re-measures on window resize.
 */
function useUnifiedFilterListWidth(containerRef, isMobile) {
  useLayoutEffect(() => {
    if (!isMobile || !containerRef.current) return;
    const container = containerRef.current;

    const measure = () => {
      const lists = Array.from(container.querySelectorAll('[data-filter-list]'));
      if (!lists.length) return;
      const max = Math.ceil(
        Math.max(
          ...lists.map((el) => {
            const clone = el.cloneNode(true);
            clone.style.width = 'max-content';
            clone.style.position = 'absolute';
            clone.style.visibility = 'hidden';
            document.body.appendChild(clone);
            const w = clone.getBoundingClientRect().width;
            clone.remove();
            return w;
          })
        )
      );
      container.style.setProperty('--filters-max-item-width', `${max}px`);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [containerRef, isMobile]);
}

export default function MobileFiltersScroller(props) {
  const isMobile = useIsMobile();
  const scrollRef = useRef(null);

  // unify widths of lists on mobile
  useUnifiedFilterListWidth(scrollRef, isMobile);

  // On desktop, just render your original Filters untouched
  if (!isMobile) {
    return <Filters {...props} />;
  }

  // On mobile, wrap Filters with a scroll container and inject the hint at the top
  return (
    <div className="filters-scroller" ref={scrollRef}>
      <div className="mobile-filter-hint">
        Scroll down to filter options to narrow down the video list
      </div>
      {/* Your original Filters content renders below and will scroll with the hint */}
      <Filters {...props} />
    </div>
  );
}
