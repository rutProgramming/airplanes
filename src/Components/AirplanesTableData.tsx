// import { useEffect, useMemo, useRef, useState } from "react";
// import Paper from "@mui/material/Paper";
// import Table from "@mui/material/Table";
// import TableHead from "@mui/material/TableHead";
// import TableBody from "@mui/material/TableBody";
// import TableRow from "@mui/material/TableRow";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import Chip from "@mui/material/Chip";
// import CircularProgress from "@mui/material/CircularProgress";
// import Box from "@mui/material/Box";

// import useDebounce from "../hooks/debounce";
// import FilterBar from "./FilterBar";

// import type { Column } from "../types/Column";
// import type { Data } from "../types/Data";
// import type { Filters } from "../types/Filters";
// import type { Sort } from "../types/Sort";

// import { useAirplanesData } from "../hooks/useAirplanesData";
// import {
//   paperStyle,
//   tableContainerStyle,
//   columnsTextStyle,
//   chipStyle,
// } from "../styles/table.styles";
// import { queryUniqueTypes } from "../api/airplanes.api";

// const ROW_HEIGHT = 48;

// const columns: readonly Column[] = [
//   { id: "id", label: "ID", width: 170 },
//   { id: "type", label: "Type", width: 120 },
//   { id: "capacity", label: "Capacity", width: 170 },
//   { id: "size", label: "Size", width: 170 },
// ];

// export default function AirplanesTableData() {
//   const [filters, setFilters] = useState<Filters>({ types: [] });
//   const debouncedFilters = useDebounce(filters);

//   const [orderBy, setOrderBy] = useState<keyof Data | null>(null);
//   const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");

//   const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);

//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const topSentinelRef = useRef<HTMLTableRowElement | null>(null);
//   const bottomSentinelRef = useRef<HTMLTableRowElement | null>(null);

//   useEffect(() => {
//     queryUniqueTypes().then(setUniqueTypes).catch(console.error);
//   }, []);

//   const sort: Sort | null = useMemo(() => {
//     if (!orderBy) return null;
//     return { field: orderBy, dir: orderDir };
//   }, [orderBy, orderDir]);

//   const {
//     rows,
//     loading,
//     totalCount,
//     topOffset,
//     loadNext,
//     loadPrev,
//     canLoadNext,
//     canLoadPrev,
//   } = useAirplanesData({
//     filters: debouncedFilters,
//     sort,
//   });

//   useEffect(() => {
//     containerRef.current?.scrollTo({ top: 0 });
//   }, [debouncedFilters, sort]);

//   const topSpacerHeight = topOffset * ROW_HEIGHT;

//   const bottomSpacerHeight = useMemo(() => {
//     if (totalCount == null) return 0;
//     const renderedEnd = topOffset + rows.length;
//     return Math.max(0, (totalCount - renderedEnd) * ROW_HEIGHT);
//   }, [totalCount, topOffset, rows.length]);

//   const [isScrollable, setIsScrollable] = useState(false);

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;
//     setIsScrollable(el.scrollHeight > el.clientHeight + 1);
//   }, [rows.length, topOffset, bottomSpacerHeight]);

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return;

//     const scrollable = el.scrollHeight > el.clientHeight + 1;

//     if (!scrollable && canLoadNext && !loading.down) {
//       loadNext();
//     }
//   }, [rows.length, canLoadNext, loading.down, loadNext]);

//   useEffect(() => {
//     const root = containerRef.current;
//     const topEl = topSentinelRef.current;
//     const bottomEl = bottomSentinelRef.current;

//     if (!root || !topEl || !bottomEl) return;

//     const topObserver = new IntersectionObserver(
//       ([entry]) => {
//         if (!entry.isIntersecting) return;
//         if (!isScrollable) return;
//         if (topOffset === 0) return;
//         if (!canLoadPrev) return;

//         loadPrev();
//       },
//       { root, rootMargin: "150px" }
//     );

//     const bottomObserver = new IntersectionObserver(
//       ([entry]) => {
//         if (!entry.isIntersecting) return;

//         if (!isScrollable) return;
//         if (!canLoadNext) return;

//         loadNext();
//       },
//       { root, rootMargin: "150px" }
//     );

//     topObserver.observe(topEl);
//     bottomObserver.observe(bottomEl);

//     return () => {
//       topObserver.disconnect();
//       bottomObserver.disconnect();
//     };
//   }, [
//     isScrollable,
//     topOffset,
//     canLoadNext,
//     canLoadPrev,
//     loadNext,
//     loadPrev,
//   ]);

//   const handleHeaderClick = (columnId: keyof Data) => {
//     if (orderBy !== columnId) {
//       setOrderBy(columnId);
//       setOrderDir("asc");
//       return;
//     }
//     if (orderDir === "asc") {
//       setOrderDir("desc");
//       return;
//     }
//     setOrderBy(null);
//   };


//  return (
//     <>
//       <FilterBar filters={filters} setFilters={setFilters} uniqueTypes={uniqueTypes} />

//       <Paper sx={paperStyle}>
//         <TableContainer ref={containerRef} sx={tableContainerStyle}>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {columns.map((col) => (
//                   <TableCell
//                     key={col.id}
//                     onClick={() => handleHeaderClick(col.id)}
//                     sx={columnsTextStyle}
//                   >
//                     {col.label}
//                     <Chip
//                       size="small"
//                       label={orderBy === col.id ? (orderDir === "asc" ? "▲" : "▼") : "⇅"}
//                       sx={chipStyle}
//                     />
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>

//             <TableBody>
//               <TableRow>
//                 <TableCell colSpan={columns.length} style={{ height: topSpacerHeight, padding: 0 }}>
//                   {loading.up && (
//                     <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//                       <CircularProgress size={20} />
//                     </Box>
//                   )}
//                 </TableCell>
//               </TableRow>

//               <TableRow ref={topSentinelRef}>
//                 <TableCell colSpan={columns.length} style={{ height: 1, padding: 0 }} />
//               </TableRow>

//               {rows.length > 0 ? (
//                 rows.map((row) => (
//                   <TableRow hover key={row.id}>
//                     {columns.map((col) => (
//                       <TableCell key={col.id}>{row[col.id]}</TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={columns.length} align="center">
//                     {loading.down ? <CircularProgress /> : "No matching airplanes found."}
//                   </TableCell>
//                 </TableRow>
//               )}

//               <TableRow ref={bottomSentinelRef}>
//                 <TableCell colSpan={columns.length} style={{ height: 1, padding: 0 }} />
//               </TableRow>

//               <TableRow>
//                 <TableCell colSpan={columns.length} style={{ height: bottomSpacerHeight, padding: 0 }}>
//                   {loading.down && (
//                     <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//                       <CircularProgress size={20} />
//                     </Box>
//                   )}
//                 </TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//     </>
//   );
// }



import { useEffect, useMemo, useRef, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import useDebounce from "../hooks/debounce";
import FilterBar from "./FilterBar";
import type { Column } from "../types/Column";
import type { Data } from "../types/Data";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";
import { useAirplanesData } from "../hooks/useAirplanesData";
import { useAirplanesActions } from "../hooks/useAirplanesActions";
import { paperStyle, tableContainerStyle, columnsTextStyle, chipStyle } from "../styles/table.styles";
import { queryUniqueTypes } from "../api/airplanes.api";

const ROW_HEIGHT = 48;

const columns: readonly Column[] = [
  { id: "id", label: "ID", width: 170 },
  { id: "type", label: "Type", width: 120 },
  { id: "capacity", label: "Capacity", width: 170 },
  { id: "size", label: "Size", width: 170 },
];

export default function AirplanesTableData() {
  const [filters, setFilters] = useState<Filters>({ types: [] });
  const debouncedFilters = useDebounce(filters);

  const [orderBy, setOrderBy] = useState<keyof Data | null>(null);
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");

  const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLTableRowElement | null>(null);
  const bottomSentinelRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    queryUniqueTypes().then(setUniqueTypes).catch(console.error);
  }, []);

  const sort: Sort | null = useMemo(() => {
    return orderBy ? { field: orderBy, dir: orderDir } : null;
  }, [orderBy, orderDir]);

  const { rows, loading, totalCount, topOffset, loadNext, loadPrev, canLoadNext, canLoadPrev } =
    useAirplanesData({ filters: debouncedFilters, sort });

  const { updateRow, deleteRow } = useAirplanesActions();

  const topSpacerHeight = topOffset * ROW_HEIGHT;

  const bottomSpacerHeight = useMemo(() => {
    if (totalCount == null) return 0;
    const renderedEnd = topOffset + rows.length;
    return Math.max(0, (totalCount - renderedEnd) * ROW_HEIGHT);
  }, [totalCount, topOffset, rows.length]);

  const isScrollableNow = () => {
    const el = containerRef.current;
    return !!el && el.scrollHeight > el.clientHeight + 1;
  };
useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [debouncedFilters, sort]);
  // Auto-fill down until container becomes scrollable

  // useEffect(() => {
  //   if (!canLoadNext || loading.down) return;
  //   if (isScrollableNow()) return;
  //   loadNext();
  // }, [rows.length, canLoadNext, loading.down, loadNext]);

  // Observers
  useEffect(() => {
    const root = containerRef.current;
    const topEl = topSentinelRef.current;
    const bottomEl = bottomSentinelRef.current;
    if (!root || !topEl || !bottomEl) return;

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // if (!isScrollableNow()) return;
        if (topOffset === 0) return;
        if (!canLoadPrev) return;
        loadPrev();
      },
      { root, rootMargin: "150px" }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // if (!isScrollableNow()) return;
        if (!canLoadNext) return;
        loadNext();
      },
      { root, rootMargin: "150px" }
    );

    topObserver.observe(topEl);
    bottomObserver.observe(bottomEl);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [topOffset, canLoadNext, canLoadPrev, loadNext, loadPrev]);

  const handleHeaderClick = (columnId: keyof Data) => {
    if (orderBy !== columnId) {
      setOrderBy(columnId);
      setOrderDir("asc");
      return;
    }
    if (orderDir === "asc") {
      setOrderDir("desc");
      return;
    }
    setOrderBy(null);
  };

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} uniqueTypes={uniqueTypes} />

      <Paper sx={paperStyle}>
        <TableContainer ref={containerRef} sx={tableContainerStyle}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.id} onClick={() => handleHeaderClick(col.id)} sx={columnsTextStyle}>
                    {col.label}
                    <Chip
                      size="small"
                      label={orderBy === col.id ? (orderDir === "asc" ? "▲" : "▼") : "⇅"}
                      sx={chipStyle}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + 1} style={{ height: topSpacerHeight, padding: 0 }}>
                  {loading.up && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </TableCell>
              </TableRow>

              <TableRow ref={topSentinelRef}>
                <TableCell colSpan={columns.length + 1} style={{ height: 1, padding: 0 }} />
              </TableRow>

              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((col) => (
                      <TableCell key={col.id}>{row[col.id]}</TableCell>
                    ))}
                    <TableCell>
                      <IconButton
                        size="small"
                        aria-label={`edit-${row.id}`}
                        onClick={() => {
                          const newType = window.prompt("Type:", String(row.type));
                          if (newType == null) return;
                          const capStr = window.prompt("Capacity:", String(row.capacity));
                          if (capStr == null) return;
                          const sizeStr = window.prompt("Size:", String(row.size));
                          if (sizeStr == null) return;

                          const capacity = Number(capStr);
                          const size = Number(sizeStr);
                          if (Number.isNaN(capacity) || Number.isNaN(size)) {
                            window.alert("Capacity and Size must be numbers.");
                            return;
                          }

                          updateRow({ id: row.id, type: newType, capacity, size });
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`delete-${row.id}`}
                        onClick={() => {
                          if (!window.confirm("Delete this airplane?")) return;
                          deleteRow(row.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    {loading.down ? <CircularProgress /> : "No matching airplanes found."}
                  </TableCell>
                </TableRow>
              )}

              <TableRow ref={bottomSentinelRef}>
                <TableCell colSpan={columns.length + 1} style={{ height: 1, padding: 0 }} />
              </TableRow>

              <TableRow>
                <TableCell colSpan={columns.length + 1} style={{ height: bottomSpacerHeight, padding: 0 }}>
                  {loading.down && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
