import type { RootState } from "../store";

export const selectAirplanesState = (s: RootState) => s.airplanes;

export const selectBufferIds = (s: RootState) => s.airplanes.bufferIds;
export const selectTopOffset = (s: RootState) => s.airplanes.topOffset;
export const selectEntities = (s: RootState) => s.airplanes.entities;
export const selectTotal = (s: RootState) => s.airplanes.totalCount;
export const selectHasMore = (s: RootState) => s.airplanes.hasMore;
export const selectLoading = (s: RootState) => s.airplanes.loading;
export const selectCursors = (s: RootState) => s.airplanes.cursors;


export const selectRowsInBuffer = (s: RootState) => {
  const st = selectAirplanesState(s);
  return st.bufferIds
    .map((id) => st.entities[id])
    .filter(Boolean);
};
