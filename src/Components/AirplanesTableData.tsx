import { useCallback, useEffect, useRef, useState } from "react";
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
import { useServerVirtualWindow } from "../hooks/useServerVirtualWindow";
import { paperStyle, tableContainerStyle, columnsTextStyle, chipStyle } from "../styles/table.styles";
import type { Filters } from "../Types/Filters";
import type { Column } from "../Types/Column";
import type { Data } from "../Types/Data";

const ROW_HEIGHT = 48;
const INITIAL_LIMIT = 7;
const PAGE_LIMIT = 20;
const MAX_BUFFER = 50;

const columns: readonly Column[] = [
  { id: "id", label: "ID", width: 170 },
  { id: "type", label: "Type", width: 120 },
  { id: "capacity", label: "Capacity", width: 170 },
  { id: "size", label: "Size", width: 170 },
];

export default function AirplanesTableData() {
  const [filters, setFilters] = useState<Filters>({types: []});
  const debouncedFilters = useDebounce(filters);
  const [orderBy, setOrderBy] = useState<keyof Data | null>(null);
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");
  const [uniqueTypes, setUniqueTypes] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/unique-types")
      .then((res) => res.json())
      .then((types) => setUniqueTypes(types ?? []))
      .catch(console.error);
  }, []);

  const fetchAirplanes = useCallback(
    async (
      cursor: number,
      direction: "up" | "down",
      limit: number,
      currentFilters: Filters,
      sortField: keyof Data | null,
      sortDir: "asc" | "desc"
    ) => {
      const params = new URLSearchParams({
        cursor: String(cursor),
        limit: String(limit),
        direction,
        filters: JSON.stringify(currentFilters ?? {}),
      });

      if (sortField) {
        params.set("sortField", String(sortField));
        params.set("sortDir", sortDir);
      }

      const res = await fetch(`/api/airplanes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch airplanes");

      const data = await res.json();      
      return {
        items: data.items ?? [],
        hasPrev: Boolean(data.hasPrev),
        hasMore: Boolean(data.hasMore),
        prevCursor: data.prevCursor ?? null,
        nextCursor: data.nextCursor ?? null,
        total: typeof data.total === "number" ? data.total : undefined,
      };
    },
    []
  );

  const { rows, loading, topRef, bottomRef, topSpacerHeight, bottomSpacerHeight } =
    useServerVirtualWindow({
      fetchFunction: fetchAirplanes,
      filters: debouncedFilters,
      sortField: orderBy,
      sortDir: orderDir,
      rowHeight: ROW_HEIGHT,
      initialLimit: INITIAL_LIMIT,
      pageLimit: PAGE_LIMIT,
      maxBuffer: MAX_BUFFER,
      containerRef,
    });

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
              <TableRow ref={topRef}>
                <TableCell colSpan={columns.length} style={{ height:  topSpacerHeight, padding: 0 }}>
                  {loading.up && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </TableCell>
              </TableRow>

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
              <TableRow ref={bottomRef}>
                <TableCell
                  colSpan={columns.length}
                  style={{ height:  bottomSpacerHeight, padding: 0 }}
                >
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
