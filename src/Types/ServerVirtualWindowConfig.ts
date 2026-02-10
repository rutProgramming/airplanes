import type { Data } from "../Types/Data";
import type { Filters } from "../Types/Filters";
export interface ServerVirtualWindowConfig {
  fetchFunction: (
    cursor: number,
    direction: "up" | "down",
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

  initialLimit?: number;
  pageLimit: number;
  maxBuffer: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}