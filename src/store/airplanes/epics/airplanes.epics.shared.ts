import type { RootState } from "../../store";

export const INITIAL_LIMIT = 7;
export const PAGE_LIMIT = 20;
export const MAX_BUFFER = 50;

export const sel = {
  hasMore: (s: RootState) => s.airplanes.hasMore,
  loading: (s: RootState) => s.airplanes.loading,
  topOffset: (s: RootState) => s.airplanes.topOffset,
  bufferLen: (s: RootState) => s.airplanes.bufferIds.length,
  entityById: (s: RootState, id: string) => s.airplanes.entities[id],
  query: (s: RootState) => s.airplanes.query,
};

export function nextCursorFromState(s: RootState): number {
  return sel.topOffset(s) + sel.bufferLen(s);
}

export function prevCursorFromState(s: RootState): number {
  return sel.topOffset(s);
}