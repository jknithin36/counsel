"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";

/** Tables longer than this render only the rows near the viewport. */
const THRESHOLD = 100;

/**
 * Window-scrolled row virtualization for plain tables. Below the threshold
 * every row renders as usual; above it, spacer rows stand in for the rest.
 */
export function useVirtualRows<T>(rows: T[], estimate = 57) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const enabled = rows.length > THRESHOLD;
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    if (!enabled || !bodyRef.current) return;
    setOffset(bodyRef.current.getBoundingClientRect().top + window.scrollY);
  }, [enabled]);

  const virtualizer = useWindowVirtualizer({
    count: enabled ? rows.length : 0,
    estimateSize: () => estimate,
    overscan: 12,
    scrollMargin: offset,
  });

  if (!enabled)
    return {
      bodyRef,
      items: rows.map((row, index) => ({ row, index })),
      before: 0,
      after: 0,
      measure: undefined,
    };

  const visible = virtualizer.getVirtualItems();
  const first = visible[0];
  const last = visible.at(-1);
  return {
    bodyRef,
    items: visible.map((v) => ({ row: rows[v.index], index: v.index })),
    before: first ? first.start - offset : 0,
    after: last ? virtualizer.getTotalSize() - (last.end - offset) : 0,
    measure: virtualizer.measureElement,
  };
}

/** An empty row that holds the height of the rows not rendered. */
export function Spacer({
  height,
  colSpan,
}: {
  height: number;
  colSpan: number;
}) {
  if (height <= 0) return null;
  return (
    <tr>
      <td aria-hidden="true" colSpan={colSpan} style={{ height, padding: 0 }} />
    </tr>
  );
}
