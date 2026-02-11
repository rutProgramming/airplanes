// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import type { Data } from "../types/Data";
// import type { ServerVirtualWindowConfig } from "../types/ServerVirtualWindowConfig";
// import { fetchAirplanesPage } from "../services/airplanes.service";


// export function useServerVirtualWindow({
//   filters,
//   sortField,
//   sortDir,
//   rowHeight,
//   initialLimit = 7,
//   pageLimit,
//   maxBuffer,
//   containerRef,
// }: ServerVirtualWindowConfig) {
//   const [rows, setRows] = useState<Data[]>([]);
//   const [loading, setLoading] = useState({ up: false, down: false });
//   const [hasMore, setHasMore] = useState({ up: false, down: true });
//   const [totalCount, setTotalCount] = useState<number | null>(null);

//   const topCursorRef = useRef(0);
//   const bottomCursorRef = useRef(0);
//   const isInitialLoadRef = useRef(true);

//   const topRef = useRef<HTMLTableRowElement | null>(null);
//   const bottomRef = useRef<HTMLTableRowElement | null>(null);

//   const topSpacerHeight = useMemo(() => topCursorRef.current * rowHeight, [rowHeight]);

//   const bottomSpacerHeight = useMemo(() => {
//     if (totalCount === null) return 0;
//     const renderedEnd = topCursorRef.current + rows.length;
//     return Math.max(0, (totalCount - renderedEnd) * rowHeight);
//   }, [totalCount, rows.length, rowHeight, topCursorRef.current]);


//   const loadInitial = useCallback(async () => {
//     setLoading({ up: false, down: true });

//     try {
//       const data = await fetchAirplanesPage({cursor: 0,direction :"down",limit: initialLimit, filters, sortField, sortDir});

//       setRows(data.items ?? []);
//       topCursorRef.current = data.prevCursor ?? 0;
//       bottomCursorRef.current = data.nextCursor ?? 0;

//       setHasMore({ up: false, down: Boolean(data.hasMore) });

//       if (typeof data.total === "number") setTotalCount(data.total);
//       else setTotalCount(null);
//       containerRef.current?.scrollTo(0, 0);
//     } catch (e) {
//       console.error("loadInitial failed:", e);
//       setRows([]);
//       setHasMore({ up: false, down: false });
//       setTotalCount(null);
//     } finally {
//       setLoading({ up: false, down: false });
//       isInitialLoadRef.current = false;
//     }
//   }, [fetchAirplanesPage, initialLimit, filters, sortField, sortDir]);

//   const loadMoreDown = useCallback(async () => {
//     if (!hasMore.down || loading.down || loading.up) return;

//     setLoading((p) => ({ ...p, down: true }));

//     try {
//       const data = await fetchAirplanesPage(
//        {cursor: bottomCursorRef.current,
//         direction:"down",
//         limit:pageLimit,
//         filters,
//         sortField,
//         sortDir
//     });

//       const items = data.items ?? [];
//       if (items.length === 0) {
//         setHasMore((p) => ({ ...p, down: false }));
//         return;
//       }

//       bottomCursorRef.current = data.nextCursor ?? bottomCursorRef.current;
//       setRows((prev) => [...prev, ...items]);

//       if (rows.length > maxBuffer) {
//         setRows((prev) => prev.slice(rows.length - maxBuffer));
//         topCursorRef.current += (rows.length - maxBuffer);
//       }
//       setHasMore((p) => ({ ...p, down: Boolean(data.hasMore), up: true }));
//       if (typeof data.total === "number") setTotalCount(data.total);
//     } catch (e) {
//       console.error("loadMoreDown failed:", e);
//     } finally {
//       setLoading((p) => ({ ...p, down: false }));
//     }
//   }, [hasMore.down, loading, fetchAirplanesPage, pageLimit, filters, sortField, sortDir]);

//   const loadMoreUp = useCallback(async () => {
//     if (!hasMore.up || loading.up || loading.down || topCursorRef.current <= 0) return;

//     const sc = containerRef.current;
//     if (!sc) return;

//     const prevHeight = sc.scrollHeight;
//     const prevTop = sc.scrollTop;

//     setLoading((p) => ({ ...p, up: true }));

//     try {
//       const data = await fetchAirplanesPage(
//         {cursor: topCursorRef.current,
//         direction:"up",
//         limit:pageLimit,
//         filters,
//         sortField,
//         sortDir
//      } );

//       const items = data.items ?? [];

//       setRows((prev) => [...items, ...prev]);
//       if (rows.length > maxBuffer) {
//         setRows((prev) => prev.slice(0, prev.length - (rows.length - maxBuffer)));
//         bottomCursorRef.current -= (rows.length - maxBuffer);
//       }
//       topCursorRef.current = data.prevCursor || 0

//       const newHeight = sc.scrollHeight;
//       sc.scrollTop = prevTop + (newHeight - prevHeight);

//       setHasMore(data.hasMore ? data.hasPrev ? { up: true, down: true } : { up: false, down: true } : { up: false, down: true });


//       if (typeof data.total === "number") setTotalCount(data.total);
//     } catch (e) {
//       console.error("loadMoreUp failed:", e);
//     } finally {
//       setLoading((p) => ({ ...p, up: false }));
//     }
//   }, [hasMore.up, loading,fetchAirplanesPage, pageLimit, filters, sortField, sortDir, containerRef]);

//   useEffect(() => {
//     loadInitial();
//   }, [loadInitial, containerRef]);

//   useEffect(() => {
//     const root = containerRef.current;
//     if (!root) return;

//     const topObserver = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) loadMoreUp();
//       },
//       { root, rootMargin: "200px" }
//     );

//     const bottomObserver = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) loadMoreDown();
//       },
//       { root, rootMargin: "200px" }
//     );

//     if (topRef.current) topObserver.observe(topRef.current);
//     if (bottomRef.current) bottomObserver.observe(bottomRef.current);

//     return () => {
//       topObserver.disconnect();
//       bottomObserver.disconnect();
//     };
//   }, [containerRef, loadMoreUp, loadMoreDown]);

//   return {
//     rows,
//     loading,
//     hasMore,
//     topRef,
//     bottomRef,
//     topSpacerHeight,
//     bottomSpacerHeight,
//     totalCount,
//   };
// }

