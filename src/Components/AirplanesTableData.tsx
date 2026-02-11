// import {useEffect, useRef, useState } from "react";
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
// import { useServerVirtualWindow } from "../hooks/useServerVirtualWindow";
// import { paperStyle, tableContainerStyle, columnsTextStyle, chipStyle } from "../styles/table.styles";
// import type { Column } from "../types/Column";
// import type { Data } from "../types/Data";
// import { fetchUniqueTypes } from "../services/airplanes.service";
// import type { Filters } from "../types/Filters";
// import FilterBar from "./FilterBar";

// const ROW_HEIGHT = 48;
// const INITIAL_LIMIT = 7;
// const PAGE_LIMIT = 20;
// const MAX_BUFFER = 50;

// const columns: readonly Column[] = [
//   { id: "id", label: "ID", width: 170 },
//   { id: "type", label: "Type", width: 120 },
//   { id: "capacity", label: "Capacity", width: 170 },
//   { id: "size", label: "Size", width: 170 },
// ];

// export default function AirplanesTableData() {
//   const [filters, setFilters] = useState<Filters>({types: []});
//   const debouncedFilters = useDebounce(filters);
//   const [orderBy, setOrderBy] = useState<keyof Data | null>(null);
//   const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");
//   const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//    fetchUniqueTypes()
//     .then(setUniqueTypes)
//     .catch(console.error);
//   }, []);

//   const { rows, loading, topRef, bottomRef, topSpacerHeight, bottomSpacerHeight } =
//     useServerVirtualWindow({
//       filters: debouncedFilters,
//       sortField: orderBy,
//       sortDir: orderDir,
//       rowHeight: ROW_HEIGHT,
//       initialLimit: INITIAL_LIMIT,
//       pageLimit: PAGE_LIMIT,
//       maxBuffer: MAX_BUFFER,
//       containerRef,
//     });

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

//   return (
//     <>
//       <FilterBar filters={filters} setFilters={setFilters} uniqueTypes={uniqueTypes} />
//       <Paper sx={paperStyle}>
        
//         <TableContainer ref={containerRef} sx={tableContainerStyle}>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {columns.map((col) => (
//                   <TableCell key={col.id} onClick={() => handleHeaderClick(col.id)} sx={columnsTextStyle}>
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
//               <TableRow ref={topRef}>
//                 <TableCell colSpan={columns.length} style={{ height:  topSpacerHeight, padding: 0 }}>
//                   {loading.up && (
//                     <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//                       <CircularProgress size={20} />
//                     </Box>
//                   )}
//                 </TableCell>
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
//               <TableRow ref={bottomRef}>
//                 <TableCell
//                   colSpan={columns.length}
//                   style={{ height:  bottomSpacerHeight, padding: 0 }}
//                 >
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

import useDebounce from "../hooks/debounce";
import FilterBar from "./FilterBar";

import type { Column } from "../types/Column";
import type { Data } from "../types/Data";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";

// import { fetchUniqueTypes } from "../services/airplanes.service"; // keep if this is not GraphQL yet

import { useAirplanesData } from "../hooks/useAirplanesData";
import { paperStyle, tableContainerStyle, columnsTextStyle, chipStyle } from "../styles/table.styles";

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
    // fetchUniqueTypes().then(setUniqueTypes).catch(console.error);
  }, []);

  const sort: Sort | null = useMemo(() => {
    if (!orderBy) return null;
    return { field: orderBy, dir: orderDir };
  }, [orderBy, orderDir]);

  const { rows, loading, totalCount, topOffset, loadNext, loadPrev } = useAirplanesData({
    filters: debouncedFilters,
    sort,
  });

  // reset scrollTop to 0 on filters/sort change (requirement)
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [debouncedFilters, sort]);

  // spacer heights come from Redux topOffset + totalCount
  const topSpacerHeight = topOffset * ROW_HEIGHT;

  const bottomSpacerHeight = useMemo(() => {
    if (totalCount == null) return 0;
    const renderedEnd = topOffset + rows.length;
    return Math.max(0, (totalCount - renderedEnd) * ROW_HEIGHT);
  }, [totalCount, topOffset, rows.length]);

  // IntersectionObservers (only dispatch loadPrev/loadNext)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadPrev();
      },
      { root, rootMargin: "200px" }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNext();
      },
      { root, rootMargin: "200px" }
    );

    if (topSentinelRef.current) topObserver.observe(topSentinelRef.current);
    if (bottomSentinelRef.current) bottomObserver.observe(bottomSentinelRef.current);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [loadPrev, loadNext]);

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
                  <TableCell
                    key={col.id}
                    onClick={() => handleHeaderClick(col.id)}
                    sx={columnsTextStyle}
                  >
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
              {/* TOP spacer + sentinel */}
              <TableRow ref={topSentinelRef}>
                <TableCell colSpan={columns.length} style={{ height: topSpacerHeight, padding: 0 }}>
                  {loading.up && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </TableCell>
              </TableRow>

              {/* Rows */}
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((col) => (
                      <TableCell key={col.id}>{row[col.id]}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {loading.down ? <CircularProgress /> : "No matching airplanes found."}
                  </TableCell>
                </TableRow>
              )}

              {/* BOTTOM spacer + sentinel */}
              <TableRow ref={bottomSentinelRef}>
                <TableCell colSpan={columns.length} style={{ height: bottomSpacerHeight, padding: 0 }}>
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
