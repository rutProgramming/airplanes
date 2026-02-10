type SortedIndex = { value: number; index: number };

export function rangeFilter(
  sorted: SortedIndex[],
  from?: number,
  to?: number
): Set<number> {
  const res = new Set<number>();
  if (from === undefined && to === undefined) return res;

  let start = 0;
  let end = sorted.length - 1;

  if (from !== undefined) {
    start = sorted.findIndex(v => v.value >= from);
    if (start === -1) return res;
  }

  if (to !== undefined) {
    end = sorted.findIndex(v => v.value > to);
    if (end === -1) end = sorted.length;
    end -= 1;
  }

  for (let i = start; i <= end; i++) {
    res.add(sorted[i].index);
  }

  return res;
}
