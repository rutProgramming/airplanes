import { Airplane } from "../routers/airplanes.router";

export const typeIndex = new Map<string, Set<number>>();
export const idIndex = new Map<string, number>();

export const capacitySorted: { value: number; index: number }[] = [];
export const sizeSorted: { value: number; index: number }[] = [];

export function buildIndexes(data: Airplane[]) {
  typeIndex.clear();
  idIndex.clear();
  capacitySorted.length = 0;
  sizeSorted.length = 0;

  data.forEach((row, i) => {
    idIndex.set(row.id, i);

    if (!typeIndex.has(row.type)) typeIndex.set(row.type, new Set());
    typeIndex.get(row.type)!.add(i);

    capacitySorted.push({ value: row.capacity, index: i });
    sizeSorted.push({ value: row.size, index: i });
  });

  capacitySorted.sort((a, b) => a.value - b.value);
  sizeSorted.sort((a, b) => a.value - b.value);
}
