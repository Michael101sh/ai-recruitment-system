import type { RefObject } from 'react';
import { useRef } from 'react';
import {
  useVirtualizer,
  type VirtualItem,
  type Virtualizer,
} from '@tanstack/react-virtual';

type UseVirtualListParams = {
  /** Total number of items to virtualise. */
  count: number;
  /** Estimated pixel height of a single row (including any gap). */
  estimateSize?: () => number;
  /** Extra rows rendered above/below the visible area for smooth scrolling. */
  overscan?: number;
  /**
   * When true the virtualiser uses a ResizeObserver (via `measureElement`)
   * to track each row's actual DOM height – required for rows whose size
   * can change at runtime (e.g. expandable cards).
   */
  dynamicHeight?: boolean;
};

type UseVirtualListResult = {
  parentRef: RefObject<HTMLDivElement>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualItems: VirtualItem[];
};

/**
 * Thin wrapper around `useVirtualizer` from @tanstack/react-virtual.
 *
 * Adapted from `useInfiniteVirtualList` in
 * https://github.com/Michael101sh/code-ocean-fechallenge – stripped of
 * the infinite-scroll / loader-row logic since this project loads the
 * full dataset at once.
 */
export function useVirtualList(
  params: UseVirtualListParams,
): UseVirtualListResult {
  const {
    count,
    estimateSize = () => 150,
    overscan = 5,
    dynamicHeight = false,
  } = params;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const parentRef = useRef<HTMLDivElement>(null!);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
    ...(dynamicHeight && {
      measureElement: (element: Element) =>
        element.getBoundingClientRect().height,
    }),
  });

  const virtualItems = virtualizer.getVirtualItems();

  return { parentRef, virtualizer, virtualItems };
}
