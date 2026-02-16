import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
  type EntityId,
  type EntityState,
} from "@reduxjs/toolkit";


export type BoundedViewState = {
  bufferIds: EntityId[];
  topOffset: number;
  totalCount: number | null;
  loading: { up: boolean; down: boolean };
  hasMore: { up: boolean; down: boolean };
  cursors: { prev: number | null; next: number | null };
};

export type BoundedEntityState<T, Id extends EntityId> = EntityState<T, Id> & BoundedViewState;

export type CreateBoundedEntitySliceArgs<T, Id extends EntityId> = {
  name: string;
  selectId: (item: T) => Id;
};

export function createBoundedEntitySlice<T, Id extends EntityId>(
  args: CreateBoundedEntitySliceArgs<T, Id>
) {
  const adapter = createEntityAdapter<T, Id>({ selectId: args.selectId });

  const initialState = adapter.getInitialState({
    bufferIds: [] as EntityId[],
    topOffset: 0,
    totalCount: null,
    loading: { up: false, down: false },
    hasMore: { up: false, down: true },
    cursors: { prev: null, next: null },
  }) as BoundedEntityState<T, Id>;

  function setBufferIds(state: BoundedEntityState<T, Id>, ids: readonly EntityId[]) {
    state.bufferIds.length = 0;
    state.bufferIds.push(...ids);
  }

  function appendIds(state: BoundedEntityState<T, Id>, ids: readonly EntityId[]) {
    state.bufferIds.push(...ids);
  }

  function prependIds(state: BoundedEntityState<T, Id>, ids: readonly EntityId[]) {
    state.bufferIds.unshift(...ids);
  }

  function trimFromTop(state: BoundedEntityState<T, Id>, count: number): EntityId[] {
    if (count <= 0) return [];
    return state.bufferIds.splice(0, count);
  }

  function trimFromBottom(state: BoundedEntityState<T, Id>, count: number): EntityId[] {
    if (count <= 0) return [];
    const start = Math.max(0, state.bufferIds.length - count);
    return state.bufferIds.splice(start, count);
  }

  function removeIdFromBuffer(state: BoundedEntityState<T, Id>, id: EntityId) {
    const idx = state.bufferIds.indexOf(id);
    if (idx !== -1) state.bufferIds.splice(idx, 1);
  }

  function removeManyFromBuffer(state: BoundedEntityState<T, Id>, ids: readonly EntityId[]) {
    if (ids.length === 0) return;
    const removeSet = new Set<EntityId>(ids as EntityId[]);
    for (let i = state.bufferIds.length - 1; i >= 0; i--) {
      if (removeSet.has(state.bufferIds[i])) state.bufferIds.splice(i, 1);
    }
  }


  function toIdArray(ids: readonly EntityId[]): readonly Id[] {
    return ids as readonly Id[];
  }

  const slice = createSlice({
    name: args.name,
    initialState,
    reducers: {
      setLoading(state, action: PayloadAction<Partial<BoundedViewState["loading"]>>) {
        state.loading = { ...state.loading, ...action.payload };
      },
      setHasMore(state, action: PayloadAction<Partial<BoundedViewState["hasMore"]>>) {
        state.hasMore = { ...state.hasMore, ...action.payload };
      },
      setTotalCount(state, action: PayloadAction<number | null>) {
        state.totalCount = action.payload;
      },

      resetView(state) {
        adapter.removeAll(state);
        state.bufferIds.length = 0;
        state.topOffset = 0;
        state.totalCount = null;
        state.loading = { up: false, down: false };
        state.hasMore = { up: false, down: true };
        state.cursors = { prev: null, next: null };
      },

      applyInitialPage(
        state,
        action: PayloadAction<{
          items: T[];
          total: number | null;
          hasMoreDown: boolean;
          hasMoreUp: boolean;
          prevCursor: number | null;
          nextCursor: number | null;
        }>
      ) {
        adapter.setAll(state, action.payload.items);

        const ids = action.payload.items.map(args.selectId) as EntityId[];
        setBufferIds(state as BoundedEntityState<T, Id>, ids);

        state.topOffset = 0;
        state.totalCount = action.payload.total;
        state.hasMore = {
          up: action.payload.hasMoreUp,
          down: action.payload.hasMoreDown,
        }; state.cursors.prev = action.payload.prevCursor;
        state.cursors.next = action.payload.nextCursor;
      },

      appendPage(
        state,
        action: PayloadAction<{
          items: T[];
          maxBuffer: number;
          hasMoreUp: boolean
          hasMoreDown: boolean;
          nextCursor: number | null;
          prevCursor?: number | null;
          total?: number | null;
        }>
      ) {
        const { items, maxBuffer, hasMoreDown, nextCursor } = action.payload;

        adapter.upsertMany(state, items);

        const newIds = items.map(args.selectId) as EntityId[];
        appendIds(state as BoundedEntityState<T, Id>, newIds);

        if (state.bufferIds.length > maxBuffer) {
          const overflow = state.bufferIds.length - maxBuffer;
          const removed = trimFromTop(state as BoundedEntityState<T, Id>, overflow);
          state.topOffset += overflow;
          adapter.removeMany(state, toIdArray(removed));
        }

        state.hasMore.down = hasMoreDown;
        if ("hasMoreUp" in action.payload) state.hasMore.up = !!action.payload.hasMoreUp;

        state.cursors.next = nextCursor;
        if ("prevCursor" in action.payload) state.cursors.prev = action.payload.prevCursor ?? state.cursors.prev;
        if ("total" in action.payload) state.totalCount = action.payload.total ?? state.totalCount;
      },

      prependPage(
        state,
        action: PayloadAction<{
          items: T[];
          maxBuffer: number;
          hasMoreUp: boolean;
          hasMoreDown: boolean
          prevCursor: number | null;
          nextCursor?: number | null;
          total?: number | null;
        }>
      ) {
        const { items, maxBuffer, hasMoreUp, prevCursor } = action.payload;

        adapter.upsertMany(state, items);

        const newIds = items.map(args.selectId) as EntityId[];
        prependIds(state as BoundedEntityState<T, Id>, newIds);

        if (state.bufferIds.length > maxBuffer) {
          const overflow = state.bufferIds.length - maxBuffer;
          const removed = trimFromBottom(state as BoundedEntityState<T, Id>, overflow);
          adapter.removeMany(state, toIdArray(removed));
        }

        state.topOffset = Math.max(0, state.topOffset - items.length);

        state.hasMore.up = hasMoreUp;
        if ("hasMoreDown" in action.payload) state.hasMore.down = !!action.payload.hasMoreDown;

        state.cursors.prev = prevCursor;
        if ("nextCursor" in action.payload) state.cursors.next = action.payload.nextCursor ?? state.cursors.next;
        if ("total" in action.payload) state.totalCount = action.payload.total ?? state.totalCount;
      },

      upsertFromServer(state, action: PayloadAction<T>) {
        adapter.upsertOne(state, action.payload);
      },
      removeFromServer(state, action: PayloadAction<{ id: Id }>) {
        adapter.removeOne(state, action.payload.id);
        removeIdFromBuffer(state as BoundedEntityState<T, Id>, action.payload.id as EntityId);
      },
      removeManyFromServer(state, action: PayloadAction<{ ids: readonly Id[] }>) {
        adapter.removeMany(state, action.payload.ids);
        removeManyFromBuffer(state as BoundedEntityState<T, Id>, action.payload.ids as readonly EntityId[]);
      },
    },
  });

  const selectors = adapter.getSelectors<BoundedEntityState<T, Id>>((s) => s);

  return { name: args.name, reducer: slice.reducer, actions: slice.actions, selectors, adapter, slice } as const;
}
