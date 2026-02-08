import type { Filters } from "../Types/Filters";
import type { Data } from "../Types/Data";

export type Sort = { field: keyof Data; dir: "asc" | "desc" };

export type PageResponse = {
  items: Data[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  total: number;
};

export async function fetchAirplanesPage(args: {
  filters: Filters;
  sort: Sort | null;
  cursor: number;
  limit: number;
  direction: "down" | "up";
}): Promise<PageResponse> {
  const params = new URLSearchParams();
  params.set("cursor", String(args.cursor));
  params.set("limit", String(args.limit));
  params.set("direction", args.direction);

  if (args.sort) {
    params.set("sortField", String(args.sort.field));
    params.set("sortDir", args.sort.dir);
  }

  params.set("filters", JSON.stringify(args.filters));

  const res = await fetch(`/api/airplanes?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch airplanes: ${res.status}`);
   return res.json();
}

export async function fetchUniqueTypes(): Promise<string[]> {
  const res = await fetch(`/api/unique-types`);
  if (!res.ok) throw new Error(`Failed to fetch unique types: ${res.status}`);
  return res.json();
}
