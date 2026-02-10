import type { Filters } from "../Types/Filters";
import type { Data } from "../Types/Data";

export type Direction = "up" | "down";

export type FetchAirplanesArgs = {
    cursor: number,
    direction: "up" | "down",
    limit: number,
    filters: Filters,
    sortField: keyof Data | null,
    sortDir: "asc" | "desc"
};

export type AirplanesPage = {
    items: Data[];
    hasPrev: boolean;
    hasMore: boolean;
    prevCursor: number | null;
    nextCursor: number | null;
    total?: number;
};

export async function fetchUniqueTypes(): Promise<string[]> {
    const res = await fetch("/api/unique-types");
    if (!res.ok) throw new Error(`Failed to fetch unique types: ${res.status}`);
    const types = await res.json();
    return Array.isArray(types) ? types : [];
}

export async function fetchAirplanesPage(args: FetchAirplanesArgs): Promise<AirplanesPage> {
    const params = new URLSearchParams({
        cursor: String(args.cursor),
        limit: String(args.limit),
        direction: args.direction,
        filters: JSON.stringify(args.filters ?? {}),
    });

    if (args.sortField) {
        params.set("sortField", String(args.sortField));
        params.set("sortDir", args.sortDir);
    }

    const res = await fetch(`/api/airplanes?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch airplanes: ${res.status}`);

    const data = await res.json();

    return {
        items: data.items ?? [],
        hasPrev: Boolean(data.hasPrev),
        hasMore: Boolean(data.hasMore),
        prevCursor: data.prevCursor ?? null,
        nextCursor: data.nextCursor ?? null,
        total: typeof data.total === "number" ? data.total : undefined,
    };
}
