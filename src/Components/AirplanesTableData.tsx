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
import TextField from "@mui/material/TextField";
import AirplaneRowActions from "./AirplaneRowActions";
import Button from "@mui/material/Button";
import AddAirplaneDialog from "./AddAirplaneDialog";
import useDebounce from "../hooks/debounce";
import FilterBar from "./FilterBar";
import type { Column } from "../types/Column";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";
import { useAirplanesData } from "../hooks/useAirplanesData";
import { useAirplanesActions } from "../hooks/useAirplanesActions";
import { paperStyle, tableContainerStyle, columnsTextStyle, chipStyle, CircularProgressStyle } from "../styles/table.styles";
import { queryUniqueTypes } from "../api/airplanes.api";
import { boxStyle } from "../styles/filterBar.styles";
import type { Airplane, AirplaneInput } from "../generated/graphql";

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
  const [orderBy, setOrderBy] = useState<keyof Airplane | null>(null);
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

  const { updateRow, createRow, deleteRow } = useAirplanesActions();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Airplane> | null>(null);

  const topSpacerHeight = topOffset * ROW_HEIGHT;

  const [addOpen, setAddOpen] = useState(false);

  const handleCreate = (input: AirplaneInput) => {
    createRow(input);
  };

  const bottomSpacerHeight = useMemo(() => {
    if (totalCount == null) return 0;
    const renderedEnd = topOffset + rows.length;
    return Math.max(0, (totalCount - renderedEnd) * ROW_HEIGHT);
  }, [totalCount, topOffset, rows.length,deleteRow]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0 });
  }, [debouncedFilters, sort]);

  useEffect(() => {
    const root = containerRef.current;
    const topEl = topSentinelRef.current;
    const bottomEl = bottomSentinelRef.current;
    if (!root || !topEl || !bottomEl) return;

    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (topOffset === 0) return;
        if (!canLoadPrev) return;
        loadPrev();
      },
      { root, rootMargin: "150px" }
    );

    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
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

  const handleHeaderClick = (columnId: keyof Airplane) => {
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
      <Box sx={boxStyle}>
        <FilterBar filters={filters} setFilters={setFilters} uniqueTypes={uniqueTypes} />
        <Button
          variant="contained"
          onClick={() => setAddOpen(true)}
        >
          Add Airplane
        </Button>
      </Box>
      <AddAirplaneDialog open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
        
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
                <TableCell sx={columnsTextStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + 1} style={{ height: topSpacerHeight, padding: 0 }}>
                  {loading.up && (
                    <Box sx={CircularProgressStyle}>
                      <CircularProgress size={20} />
                    </Box>
                  )}
                </TableCell>
              </TableRow>

              <TableRow ref={topSentinelRef}>
                <TableCell colSpan={columns.length + 1}
                  style={{ height: 1, padding: 0 }}
                />
              </TableRow>

              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((col) => (
                      <TableCell key={col.id}>
                        {editingId === row.id && col.id !== "id" ? (
                          <TextField
                            size="small"
                            value={
                              draft && draft[col.id] !== undefined ? String(draft[col.id]) : String(row[col.id])
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft((d) => ({ ...(d ?? {}), [col.id]: col.id === "type" ? val : Number(val) }));
                            }}
                          />
                        ) : (
                          row[col.id]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <AirplaneRowActions
                        row={row}
                        editingId={editingId}
                        draft={draft}
                        setEditingId={setEditingId}
                        setDraft={setDraft}
                        updateRow={updateRow}
                        deleteRow={deleteRow}
                      />
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
                <TableCell colSpan={columns.length + 1}
                  style={{ height: 1, padding: 0 }}
                />
              </TableRow>

              <TableRow>
                <TableCell colSpan={columns.length + 1} style={{ height: bottomSpacerHeight, padding: 0 }}>
                  {loading.down && (
                    <Box sx={CircularProgressStyle}>
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
