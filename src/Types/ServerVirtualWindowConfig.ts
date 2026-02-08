import type { Data } from "./Data";
import type { Filters } from "./Filters";
type Dir = "up" | "down";

export interface ServerVirtualWindowConfig {
  fetchFunction: (
    cursor: number,
    direction: Dir,
    limit: number,
    filters: Filters,
    sortField: keyof Data | null,
    sortDir: "asc" | "desc"
  ) => Promise<{
    items: Data[];
    hasMore: boolean; 
    hasPrev: boolean;
    total?: number;
    nextCursor: number | null;
    prevCursor: number | null;
  }>;

  filters: Filters;
  sortField: keyof Data | null;


  sortDir: "asc" | "desc";

  rowHeight: number;
  initial: number; 
  step: number;
  windowSize: number; 
  containerRef: React.RefObject<HTMLDivElement | null>;
}

