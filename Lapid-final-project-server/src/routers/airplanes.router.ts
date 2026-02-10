

import Router from "@koa/router";
import { resolveView } from "../services/resolveView.service";
import { getAirplanesById } from "../services/airplanes.service";
import { buildIndexes, typeIndex } from "../utils/indexes";
import airplanes from "../data/airplanes.json";


export type Airplane = {
  id: string;
  type: string;
  capacity: number;
  size: number;
};

export type Filters = Partial<{
  id: number;
  types: string[];
  capacityFrom: number;
  capacityTo: number;
  sizeFrom: number;
  sizeTo: number;
}>;

export type Sort = {
  field: keyof Airplane;
  dir: 'asc' | 'desc';
};

export type ViewCache = {
  filters: Filters | null;
  filtered: number[] | null;
  sort: Sort | null;
  sorted: number[] | null;
};
const router = new Router();

buildIndexes(airplanes);
router.get("/unique-types", ctx => {
  ctx.body = Array.from(typeIndex.keys());
});

router.get("/airplanes", (ctx) => {
  const {
    filters,
    sortField,
    sortDir,
    cursor = "0",
    limit = "20",
    direction = "down",
  } = ctx.query as {
    filters?: string;
    sortField?: keyof Airplane;
    sortDir?: "asc" | "desc";
    cursor?: string;
    limit?: string;
    direction?: "up" | "down";
  };

  const filtersParsed: Filters = filters ? JSON.parse(filters) : {};
  const sort = sortField && sortDir ? { field: sortField, dir: sortDir } : null;

  const indices = resolveView(filtersParsed, sort);

  const pageSize = Math.max(1, Math.min(Number(limit) || 20, 200));

  const rawCur = Number(cursor);
  if (!Number.isFinite(rawCur) || rawCur < 0) {
    ctx.status = 400;
    ctx.body = { error: "Invalid cursor" };
    return;
  }

  const cur = Math.min(rawCur, indices.length);

  let start: number;
  let end: number;

  if (direction === "up") {
    end = cur; 
    start = Math.max(end - pageSize, 0);
  } else {
    start = cur; 
    end = Math.min(start + pageSize, indices.length);
  }

  const page = indices.slice(start, end);

  const nextCursor = end >= indices.length ? null : end;
  const prevCursor = start <= 0 ? null : start;

  const hasPrev = start > 0;
  const hasMore = end < indices.length;

  ctx.body = {
    items: getAirplanesById(page),
    nextCursor,
    prevCursor,
    hasMore,
    hasPrev,
    total: indices.length,
  };
});

export default router;