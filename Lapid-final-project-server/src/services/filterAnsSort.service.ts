import { Filters, Sort } from "../routers/airplanes.router";
import { capacitySorted, idIndex, sizeSorted, typeIndex } from "../utils/indexes";
import { rangeFilter } from "../utils/rangeFilter";
import airplanes from "../data/airplanes.json";



export const filterToSet = (
    key: keyof Filters,
    value: number | string
): Set<number> => {
    if (key === "types") {
        return typeIndex.get(String(value)) ?? new Set();
    }

    if (key === "id") {
        const q = String(value).toLowerCase();

        const matches = new Set<number>();

        for (let i = 0; i < airplanes.length; i++) {
            if (airplanes[i].id.toLowerCase().includes(q)) {
                matches.add(i);
            }
        }

        return matches;
    }


    if (key === "capacityFrom" || key === "capacityTo") {
        return rangeFilter(
            capacitySorted,
            key === "capacityFrom" ? Number(value) : undefined,
            key === "capacityTo" ? Number(value) : undefined
        );
    }

    if (key === "sizeFrom" || key === "sizeTo") {
        return rangeFilter(
            sizeSorted,
            key === "sizeFrom" ? Number(value) : undefined,
            key === "sizeTo" ? Number(value) : undefined
        );
    }

    return new Set();
};
export const applyAddedFilters = (
    base: readonly number[],
    added: readonly (readonly [keyof Filters, number | string])[]
): number[] => {
    return base.filter(i =>
        added.every(([key, value]) => filterToSet(key, value).has(i))
    );
};

export const noChangesDone = (
    filterPrev: Filters | null,
    filterNext: Filters | null,
    sortPrev: Sort | null,
    sortNext: Sort | null
): boolean => {
    const filtersEqual = (!filterPrev && !filterNext) || JSON.stringify(filterPrev) === JSON.stringify(filterNext);
    const sortEqual = (!sortPrev && !sortNext) || JSON.stringify(sortPrev) === JSON.stringify(sortNext);

    return filtersEqual && sortEqual;
};

export const isSuperset = (
    prev: Filters,
    next: Filters
): boolean =>
    Object.entries(prev).every(
        ([k, v]) => next[k as keyof Filters] === v
    );



export const filterAllFromScratch = (filters: Filters): number[] => {
    const base = airplanes.map((_, i) => i);

    const allowed: Set<number>[] = [];


    if (filters.id !== undefined && filters.id !== null) {
        const q = String(filters.id).trim();
        const matched = new Set<number>();
        for (const [k, v] of idIndex.entries()) {
            if (String(k).includes(q)) matched.add(v);
        }
        allowed.push(matched);
    }


    if (filters.types && filters.types.length > 0) {
        const typesSet = new Set<number>();
        for (const t of filters.types) {
            for (const v of typeIndex.get(t) ?? []) typesSet.add(v);
        }
        allowed.push(typesSet);
    }

    if (filters.capacityFrom !== undefined || filters.capacityTo !== undefined) {
        allowed.push(rangeFilter(capacitySorted, filters.capacityFrom, filters.capacityTo));
    }

    if (filters.sizeFrom !== undefined || filters.sizeTo !== undefined) {
        allowed.push(rangeFilter(sizeSorted, filters.sizeFrom, filters.sizeTo));
    }

    if (allowed.length === 0) return base;

    return base.filter(i => allowed.every(s => s.has(i)));
};


export const addedFilters = (
    prev: Filters | null,
    next: Filters
): readonly (readonly [keyof Filters, number | string])[] =>
    Object.entries(next).filter(
        ([k, v]) => !prev || prev[k as keyof Filters] !== v
    ) as readonly (readonly [keyof Filters, number | string])[];

export const sortIndexes = (
    indexes: readonly number[],
    sort: Sort
): number[] =>
    [...indexes].sort((a, b) =>
        sort.dir === 'asc'
            ? airplanes[a][sort.field] > airplanes[b][sort.field] ? 1 : -1
            : airplanes[a][sort.field] < airplanes[b][sort.field] ? 1 : -1
    );