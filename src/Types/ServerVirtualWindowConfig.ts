import type { Data } from "../Types/Data";
import type { Filters } from "../Types/Filters";
export interface ServerVirtualWindowConfig {
  filters: Filters;
  sortField: keyof Data | null;
  sortDir: "asc" | "desc";
  rowHeight: number;

  initialLimit?: number;
  pageLimit: number;
  maxBuffer: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}