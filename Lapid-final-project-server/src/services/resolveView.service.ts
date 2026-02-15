
import { Filters, Sort } from "../routers/airplanes.router";
import { addedFilters, applyAddedFilters, filterAllFromScratch, isSuperset, sortIndexes } from "./filterAnsSort.service";
import { getCache, setCache } from "./viewCache.service";

export function resolveView(
  filters: Filters,
  sort: Sort | null
): number[] {
  const cache = getCache();

  const noChanges =
    cache.filters &&
    cache.sort === sort &&
    cache.filters === filters;

  if (noChanges && cache.sorted) {
    return cache.sorted;
  }

  const hasPrevFilters = !!cache.filters && !!cache.filtered;
  const hasPrevSort = !!cache.sort && !!cache.sorted;
  const wantsSort = sort !== null;
  const sameSort = hasPrevSort && wantsSort && cache.sort === sort;

  const onlyAdded =
    hasPrevFilters && isSuperset(cache.filters!, filters);


  const baseFiltered: readonly number[] =
    onlyAdded && cache.filtered
      ? [...cache.filtered]
      : [...filterAllFromScratch(filters)];

  const filtered: readonly number[] =
    onlyAdded && cache.filters
      ? applyAddedFilters(
        hasPrevSort && sameSort
          ? cache.sorted!
          : baseFiltered,
        addedFilters(cache.filters, filters)
      )
      : baseFiltered;


  const sorted: number[] =
    wantsSort
      ? sameSort && hasPrevSort
        ? [...filtered]
        : sortIndexes([...filtered], sort!)
      : [...filtered];


  setCache({
    filters,
    filtered: [...filtered],
    sort: wantsSort ? sort : null,
    sorted
  });

  return sorted;
}
