import type { ReactNode } from 'react';
import { useVirtualList } from '../hooks/useVirtualList';

type VirtualListProps<T> = {
  items: T[];
  renderRow: (item: T, index: number) => ReactNode;
  /** Estimated pixel height per row (including gap). */
  estimateSize?: () => number;
  /** Extra rows above/below viewport. */
  overscan?: number;
  /** Additional classes on the scroll container. */
  className?: string;
  /** Pixel gap between rows – applied as bottom-padding on each row. */
  gap?: number;
  /**
   * When true, each row is measured with a ResizeObserver so the
   * virtualiser tracks its actual height.  Required when rows can
   * expand / collapse at runtime.
   */
  dynamicHeight?: boolean;
};

/**
 * Generic virtualised list component.
 *
 * Follows the same absolute-position + translateY pattern used in
 * https://github.com/Michael101sh/code-ocean-fechallenge – adapted to
 * support both fixed and dynamic row heights.
 */
function VirtualList<T>({
  items,
  renderRow,
  estimateSize = () => 150,
  overscan = 5,
  className = '',
  gap = 0,
  dynamicHeight = false,
}: VirtualListProps<T>) {
  const { parentRef, virtualizer, virtualItems } = useVirtualList({
    count: items.length,
    estimateSize,
    overscan,
    dynamicHeight,
  });

  return (
    /* flex-1 fills remaining height; min-h-0 lets it shrink inside flex containers. */
    <div
      ref={parentRef}
      className={`flex-1 min-h-0 overflow-auto ${className}`}
    >
      {/* Inner div is sized to the total virtual height so the scrollbar is accurate. */}
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index] as T;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={dynamicHeight ? virtualizer.measureElement : undefined}
              className="absolute top-0 left-0 w-full"
              style={
                dynamicHeight
                  ? { transform: `translateY(${virtualItem.start}px)` }
                  : {
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }
              }
            >
              <div
                style={gap > 0 ? { paddingBottom: `${gap}px` } : undefined}
              >
                {renderRow(item, virtualItem.index)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
