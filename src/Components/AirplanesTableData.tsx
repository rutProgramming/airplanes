import { useMemo, useRef, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import airplanes from '../data/airplanes.json';
import useDebounce from '../hooks/debounce';
import FilterBar from './FilterBar';
import { useVirtualWindow } from '../hooks/useVirtualWindow';
import { paperStyle, tableContainerStyle, columnsTextStyle, chipStyle } from '../styles/table.styles';
import type { Filters } from '../Types/Filters';
import type { Column } from '../Interfaces/Column';
import type { Data } from '../Interfaces/Data';

const ROW_HEIGHT = 48;
const INITIAL_ROWS = 7;
const MAX_WINDOW = 50;
const STEP = 20

const columns: readonly Column[] = [
  { id: 'id', label: 'ID', width: 170 },
  { id: 'type', label: 'Type', width: 120 },
  { id: 'capacity', label: 'Capacity', width: 170 },
  { id: 'size', label: 'Size', width: 170},
];

const compareValues = (a: number | string, b: number | string) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en');
};

export default function AirplanesTableData() {
  const [filters, setFilters] = useState<Filters>({});
  const debouncedFilters = useDebounce(filters);
  const [orderBy, setOrderBy] = useState<keyof Data | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uniqueTypes = useMemo(
    () => Array.from(new Set(airplanes.map(a => a.type))),
    []
  );

  const processedRows = useMemo(() => {
    let result = airplanes.filter(row => {
      if (debouncedFilters.id && !row.id.toLowerCase().includes(debouncedFilters.id.toLowerCase())) return false;
      if (debouncedFilters.types?.length && !debouncedFilters.types.includes(row.type)) return false;
      if (debouncedFilters.capacityFrom !== undefined && row.capacity < debouncedFilters.capacityFrom) return false;
      if (debouncedFilters.capacityTo !== undefined && row.capacity > debouncedFilters.capacityTo) return false;
      if (debouncedFilters.sizeFrom !== undefined && row.size < debouncedFilters.sizeFrom) return false;
      if (debouncedFilters.sizeTo !== undefined && row.size > debouncedFilters.sizeTo) return false;
      return true;
    });

    if (orderBy) {
      result = [...result].sort((a, b) =>
        compareValues(a[orderBy], b[orderBy])
      );
    }

    return result;
  }, [debouncedFilters, orderBy]);

  const {
    startIndex,
    endIndex,
    topRef,
    bottomRef,
    topSpacerHeight,
    bottomSpacerHeight,
  } = useVirtualWindow({
    total: processedRows.length,
    rowHeight: ROW_HEIGHT,
    initial: INITIAL_ROWS,
    windowSize: MAX_WINDOW,
    step: STEP,
    containerRef,
  });

  const renderedRows = useMemo(
    () => processedRows.slice(startIndex, endIndex),
    [processedRows, startIndex, endIndex]
  );

  return (
    <>
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        uniqueTypes={uniqueTypes}
      />

      <Paper sx={paperStyle}>
        <TableContainer
          ref={containerRef}
          sx={tableContainerStyle}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell
                    key={col.id}
                    onClick={() =>
                      setOrderBy(prev => (prev === col.id ? null : col.id))
                    }
                    sx={columnsTextStyle}
                  >
                    {col.label}
                    
                    <Chip
                      size="small"
                      label={orderBy === col.id ? '▲' : '⇅'}
                      sx={chipStyle}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {startIndex > 0 && (
                <TableRow ref={topRef}>
                  <TableCell
                    colSpan={columns.length}
                    style={{ height: topSpacerHeight, padding: 0 }}
                  />
                </TableRow>
              )}

              {renderedRows.length > 0 ? (
                renderedRows.map(row => (
                  <TableRow hover key={row.id}>
                    {columns.map(col => (
                      <TableCell key={col.id}>
                        {row[col.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                  >
                    No matching airplanes found.
                  </TableCell>
                </TableRow>
              )}

              {endIndex < processedRows.length && (
                <TableRow ref={bottomRef}>
                  <TableCell
                    colSpan={columns.length}
                    style={{ height: bottomSpacerHeight, padding: 0 }}
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
