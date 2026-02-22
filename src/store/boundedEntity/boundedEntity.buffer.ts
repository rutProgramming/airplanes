import type { Draft } from "immer";
import type { EntityId } from "@reduxjs/toolkit";
import type { Filters } from "../../types/Filters";
import type { Sort } from "../../types/Sort";

export type DraftState<Id extends EntityId> = Draft<BoundedViewState<Id>>;
export type DraftId<Id extends EntityId> = Draft<Id>;

export type BoundedViewState<Id extends EntityId> = {
  viewDirty: boolean;
  bufferIds: Id[];
  topOffset: number;
  totalCount: number | null;
  loading: { up: boolean; down: boolean };
  hasMore: { up: boolean; down: boolean };
  cursors: { prev: number | null; next: number | null };
  error: string | null;
  query: { filters: Filters; sort: Sort | null };
  uniqueTypes: string[];
  refreshInFlight: boolean;
};

export function setBufferIds<Id extends EntityId>(
  state: DraftState<Id>,
  ids: readonly DraftId<Id>[]
) {
  state.bufferIds.length = 0;
  state.bufferIds.push(...ids);
}

export function appendIds<Id extends EntityId>(
  state: DraftState<Id>,
  ids: readonly DraftId<Id>[]
) {
  state.bufferIds.push(...ids);
}

export function prependIds<Id extends EntityId>(
  state: DraftState<Id>,
  ids: readonly DraftId<Id>[]
) {
  state.bufferIds.unshift(...ids);
}

export function trimFromTop<Id extends EntityId>(
  state: DraftState<Id>,
  count: number
): DraftId<Id>[] {
  if (count <= 0) return [];
  return state.bufferIds.splice(0, count) as DraftId<Id>[];
}

export function trimFromBottom<Id extends EntityId>(
  state: DraftState<Id>,
  count: number
): DraftId<Id>[] {
  if (count <= 0) return [];
  const start = Math.max(0, state.bufferIds.length - count);
  return state.bufferIds.splice(start, count) as DraftId<Id>[];
}

export function removeManyFromBuffer<Id extends EntityId>(
  state: DraftState<Id>,
  ids: readonly DraftId<Id>[]
) {
  if (ids.length === 0) return;

  const removeSet = new Set<DraftId<Id>>(ids);
  for (let i = state.bufferIds.length - 1; i >= 0; i--) {
    if (removeSet.has(state.bufferIds[i] as DraftId<Id>)) {
      state.bufferIds.splice(i, 1);
    }
  }
}