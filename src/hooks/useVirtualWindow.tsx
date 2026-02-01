import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VirtualWindowConfig } from '../Types/VirtualWindowConfig';


export function useVirtualWindow({total, rowHeight,initial,windowSize,step,containerRef,}: VirtualWindowConfig) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(initial);

  const topRef = useRef<HTMLTableRowElement | null>(null);
  const bottomRef = useRef<HTMLTableRowElement | null>(null);

  const topSpacerHeight = useMemo(
    () => startIndex * rowHeight,
    [startIndex, rowHeight]
  );

  const bottomSpacerHeight = useMemo(
    () => Math.max(0, (total - endIndex) * rowHeight),
    [total, endIndex, rowHeight]
  );

  const shiftDown = useCallback(() => {
    if (endIndex >= total) return;

    setStartIndex(prev => {
      const nextEnd = endIndex + step;
      return nextEnd - prev > windowSize ? prev + step : prev;
    });

    setEndIndex(prev => Math.min(prev + step, total));
  }, [endIndex, step, windowSize, total]);

  const shiftUp = useCallback(() => {
    if (startIndex <= 0) return;

    setStartIndex(prev => Math.max(prev - step, 0));

    setEndIndex(prev => {
      const nextStart = startIndex - step;
      return prev - nextStart > windowSize ? prev - step : prev;
    });
  }, [startIndex, step, windowSize]);

  useEffect(() => {
    if (!containerRef.current || !bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && shiftDown(),
      { root: containerRef.current }
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [shiftDown, containerRef]);

  useEffect(() => {
    if (!containerRef.current || !topRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && shiftUp(),
      { root: containerRef.current }
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [shiftUp, containerRef]);

  useEffect(() => {
    setStartIndex(0);
    setEndIndex(initial);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [total, initial, containerRef]);

  return {
    startIndex,
    endIndex,
    topRef,
    bottomRef,
    topSpacerHeight,
    bottomSpacerHeight,
  };
}
