import { Filters, Sort } from "../routers/airplanes.router";
import {
  addedFilters,
  applyRestrictiveFilters,
  filterAllFromScratch,
  canOptimizeFilters,
  sortIndexes
} from "./filterAnsSort.service";
import { getCache, setCache } from "./viewCache.service";

function areFiltersEqual(a: Filters | null, b: Filters | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function areSortsEqual(a: Sort | null, b: Sort | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.field === b.field && a.dir === b.dir;
}




export function resolveView(filters: Filters, sort: Sort | null): number[] {
  const cache = getCache();

  const noChanges =
    cache.sorted &&
    areFiltersEqual(cache.filters, filters) &&
    areSortsEqual(cache.sort, sort);

  if (noChanges && cache.sorted) return cache.sorted;

  const hasPrevFilters = !!cache.filters && !!cache.filtered;
  const hasPrevSort = !!cache.sort && !!cache.sorted;
  const wantsSort = sort !== null;
  const sameSort = hasPrevSort && wantsSort && areSortsEqual(cache.sort, sort);

  const onlyAddedRestrictive =
    hasPrevFilters && canOptimizeFilters(cache.filters!, filters);

  const useSortedBase =
    onlyAddedRestrictive && sameSort && !!cache.sorted; 

  const filtered: readonly number[] =
    onlyAddedRestrictive && cache.filtered
      ? applyRestrictiveFilters(
          useSortedBase ? cache.sorted! : cache.filtered!,
          addedFilters(cache.filters!, filters)
        )
      : filterAllFromScratch(filters);

  const sorted: number[] =
    wantsSort
      ? useSortedBase
        ? [...filtered] 
        : sortIndexes([...filtered], sort!) 
      : [...filtered];

  setCache({
    filters,
    filtered: [...filtered],
    sort: wantsSort ? sort : null,
    sorted,
  });

  return sorted;
}
