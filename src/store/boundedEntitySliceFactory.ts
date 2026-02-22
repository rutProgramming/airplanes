import {
  createSlice,
  createEntityAdapter,
  type PayloadAction,
  type EntityId,
  type EntityState,
} from "@reduxjs/toolkit";
import type { Draft } from "immer";


export type BoundedViewState<Id> = {
  viewDirty: boolean,
  bufferIds: Id[];
  topOffset: number;
  totalCount: number | null;
  loading: { up: boolean; down: boolean };
  hasMore: { up: boolean; down: boolean };
  cursors: { prev: number | null; next: number | null };
  error: string | null;
};

export type BoundedEntityState<T, Id extends EntityId> =
  EntityState<T, Id> & BoundedViewState<Id>;

export type CreateBoundedEntitySliceArgs<T, Id extends EntityId> = {
  name: string;
  selectId: (item: T) => Id;
};



export function createBoundedEntitySlice<T, Id extends EntityId>(
  args: CreateBoundedEntitySliceArgs<T, Id>
) {
  const adapter = createEntityAdapter<T, Id>({
    selectId: args.selectId,
  });

  const initialState: BoundedEntityState<T, Id> =
    adapter.getInitialState({
      viewDirty: false,
      bufferIds: [] as Id[],
      topOffset: 0,
      totalCount: null,
      loading: { up: false, down: false },
      hasMore: { up: false, down: true },
      cursors: { prev: null, next: null },
      error: null,
    });

  type DraftState = Draft<BoundedEntityState<T, Id>>;
  type DraftId = Draft<Id>;



  function setBufferIds(state: DraftState, ids: readonly DraftId[]) {
    state.bufferIds.length = 0;
    state.bufferIds.push(...ids);
  }

  function appendIds(state: DraftState, ids: readonly DraftId[]) {
    state.bufferIds.push(...ids);
  }

  function prependIds(state: DraftState, ids: readonly DraftId[]) {
    state.bufferIds.unshift(...ids);
  }

  function trimFromTop(state: DraftState, count: number): DraftId[] {
    if (count <= 0) return [];
    return state.bufferIds.splice(0, count);
  }

  function trimFromBottom(state: DraftState, count: number): DraftId[] {
    if (count <= 0) return [];
    const start = Math.max(0, state.bufferIds.length - count);
    return state.bufferIds.splice(start, count);
  }

  function removeIdFromBuffer(state: DraftState, id: DraftId) {
    const idx = state.bufferIds.indexOf(id);
    if (idx !== -1) state.bufferIds.splice(idx, 1);
  }

  function removeManyFromBuffer(state: DraftState, ids: readonly DraftId[]) {
    if (ids.length === 0) return;
    const removeSet = new Set<DraftId>(ids);
    for (let i = state.bufferIds.length - 1; i >= 0; i--) {
      if (removeSet.has(state.bufferIds[i])) {
        state.bufferIds.splice(i, 1);
      }
    }
  }


  const slice = createSlice({
    name: args.name,
    initialState,
    reducers: {

      setLoading(
        state,
        action: PayloadAction<Partial<BoundedViewState<Id>["loading"]>>
      ) {
        state.loading = { ...state.loading, ...action.payload };
      },

      setHasMore(
        state,
        action: PayloadAction<Partial<BoundedViewState<Id>["hasMore"]>>
      ) {
        state.hasMore = { ...state.hasMore, ...action.payload };
      },

      setTotalCount(state, action: PayloadAction<number | null>) {
        state.totalCount = action.payload;
      },

      setError(state, action: PayloadAction<string | null>) {
        state.error = action.payload;
      },

      resetView(state) {
        adapter.removeAll(state);
        state.bufferIds.length = 0;
        state.topOffset = 0;
        state.totalCount = null;
        state.loading = { up: false, down: false };
        state.hasMore = { up: false, down: true };
        state.cursors = { prev: null, next: null };
        state.error = null;
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

        const ids = action.payload.items.map(
          args.selectId
        ) as DraftId[];

        setBufferIds(state, ids);

        state.topOffset = 0;
        state.totalCount = action.payload.total;
        state.hasMore = {
          up: action.payload.hasMoreUp,
          down: action.payload.hasMoreDown,
        };
        state.cursors.prev = action.payload.prevCursor;
        state.cursors.next = action.payload.nextCursor;
      },

      appendPage(
        state,
        action: PayloadAction<{
          items: T[];
          maxBuffer: number;
          hasMoreUp: boolean;
          hasMoreDown: boolean;
          nextCursor: number | null;
          prevCursor?: number | null;
          total?: number | null;
        }>
      ) {
        const {
          items,
          maxBuffer,
          hasMoreDown,
          hasMoreUp,
          nextCursor,
        } = action.payload;

        adapter.upsertMany(state, items);

        const newIds = items.map(
          args.selectId
        ) as DraftId[];

        appendIds(state, newIds);

        if (state.bufferIds.length > maxBuffer) {
          const overflow = state.bufferIds.length - maxBuffer;
          const removed = trimFromTop(state, overflow);
          state.topOffset += overflow;
          adapter.removeMany(state, removed as Id[]);
        }

        state.hasMore.down = hasMoreDown;
        state.hasMore.up = hasMoreUp;
        state.cursors.next = nextCursor;

        if (action.payload.prevCursor !== undefined) {
          state.cursors.prev =
            action.payload.prevCursor ?? state.cursors.prev;
        }

        if (action.payload.total !== undefined) {
          state.totalCount =
            action.payload.total ?? state.totalCount;
        }
      },

      prependPage(
        state,
        action: PayloadAction<{
          items: T[];
          maxBuffer: number;
          hasMoreUp: boolean;
          hasMoreDown: boolean;
          prevCursor: number | null;
          nextCursor?: number | null;
          total?: number | null;
        }>
      ) {
        const {
          items,
          maxBuffer,
          hasMoreUp,
          hasMoreDown,
          prevCursor,
        } = action.payload;

        adapter.upsertMany(state, items);

        const newIds = items.map(
          args.selectId
        ) as DraftId[];

        prependIds(state, newIds);

        if (state.bufferIds.length > maxBuffer) {
          const overflow = state.bufferIds.length - maxBuffer;
          const removed = trimFromBottom(state, overflow);
          adapter.removeMany(state, removed as Id[]);
        }

        state.topOffset = Math.max(
          0,
          state.topOffset - newIds.length
        );

        state.hasMore.up = hasMoreUp;
        state.hasMore.down = hasMoreDown;
        state.cursors.prev = prevCursor;

        if (action.payload.nextCursor !== undefined) {
          state.cursors.next =
            action.payload.nextCursor ?? state.cursors.next;
        }

        if (action.payload.total !== undefined) {
          state.totalCount =
            action.payload.total ?? state.totalCount;
        }
      },


      // addFromServer(state, action: PayloadAction<T>) {
      //   const id = args.selectId(action.payload) as DraftId;

      //   adapter.upsertOne(state, action.payload);

      //   if (!state.bufferIds.includes(id)) {
      //     state.bufferIds.push(id);
      //   }
      // },

      upsertFromServer(state, action: PayloadAction<T>) {
        adapter.upsertOne(state, action.payload);
      },
      markDirty(state) {
        state.viewDirty = true;
      },

      clearDirty(state) {
        state.viewDirty = false;
      },

      removeFromServer(
        state,
        action: PayloadAction<{ id: Id }>
      ) {
        adapter.removeOne(state, action.payload.id);
        removeIdFromBuffer(
          state,
          action.payload.id as DraftId
        );

        state.totalCount =
          state.totalCount != null
            ? Math.max(0, state.totalCount - 1)
            : null;
      },

      removeManyFromServer(
        state,
        action: PayloadAction<{ ids: readonly Id[] }>
      ) {
        adapter.removeMany(state, action.payload.ids);
        removeManyFromBuffer(
          state,
          action.payload.ids as DraftId[]
        );
      },

    },
  });

  const selectors =
    adapter.getSelectors<BoundedEntityState<T, Id>>(
      (s) => s
    );

  return {
    name: args.name,
    reducer: slice.reducer,
    actions: slice.actions,
    selectors,
    adapter,
    slice,
  } as const;
}
