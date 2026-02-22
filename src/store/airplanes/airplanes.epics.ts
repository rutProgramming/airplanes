import { ofType, type Epic } from "redux-observable";
import { concat, from, of, forkJoin } from "rxjs";
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  ignoreElements,
  map,
  mergeMap,
  retryWhen,
  scan,
  switchMap,
  takeUntil,
  withLatestFrom,
  debounceTime,
} from "rxjs/operators";

import type { RootState } from "../store";

import {
  airplanesInitRequested,
  airplanesNextRequested,
  airplanesPrevRequested,
  airplanesUpdateRequested,
  airplanesCreateRequested,
  airplanesDeleteRequested,
  airplanesSubStart,
  airplanesSubStop,
} from "./airplanes.epicActions";

import {
  mutateUpdateAirplane,
  mutateDeleteAirplane,
  mutateCreateAirplane,
  queryAirplanesPage,
  subscribeAirplaneChanges,
  type ChangeEvent,
  queryUniqueTypes,
} from "../../api/airplanes.api";

import { airplanesActions } from "./airplanes.slice";

const INITIAL_LIMIT = 7;
const PAGE_LIMIT = 20;
const MAX_BUFFER = 50;

const sel = {
  hasMore: (s: RootState) => s.airplanes.hasMore,
  loading: (s: RootState) => s.airplanes.loading,
  topOffset: (s: RootState) => s.airplanes.topOffset,
  bufferLen: (s: RootState) => s.airplanes.bufferIds.length,
  entityById: (s: RootState, id: string) => s.airplanes.entities[id],
};

function nextCursorFromState(s: RootState): number {
  return sel.topOffset(s) + sel.bufferLen(s);
}
function prevCursorFromState(s: RootState): number {
  return sel.topOffset(s);
}

type AirplanesInActions =
  | ReturnType<typeof airplanesInitRequested>
  | ReturnType<typeof airplanesNextRequested>
  | ReturnType<typeof airplanesPrevRequested>
  | ReturnType<typeof airplanesUpdateRequested>
  | ReturnType<typeof airplanesCreateRequested>
  | ReturnType<typeof airplanesDeleteRequested>
  | ReturnType<typeof airplanesSubStart>
  | ReturnType<typeof airplanesSubStop>;

type AirplanesOutActions =
  | ReturnType<typeof airplanesActions.setLoading>
  | ReturnType<typeof airplanesActions.setHasMore>
  | ReturnType<typeof airplanesActions.setTotalCount>
  | ReturnType<typeof airplanesActions.resetView>
  | ReturnType<typeof airplanesActions.applyInitialPage>
  | ReturnType<typeof airplanesActions.appendPage>
  | ReturnType<typeof airplanesActions.prependPage>
  | ReturnType<typeof airplanesActions.removeManyFromServer>
  | ReturnType<typeof airplanesActions.setError>
  | ReturnType<typeof airplanesActions.markDirty>
  | ReturnType<typeof airplanesActions.clearDirty>
  | ReturnType<typeof airplanesActions.setUniqueTypes>;

export type AppAction = AirplanesInActions | AirplanesOutActions;

export const airplanesInitEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
  action$.pipe(
    filter(airplanesInitRequested.match),
    switchMap((action) =>
      concat(
        of(
          airplanesActions.setError(null),
          airplanesActions.setLoading({ down: true, up: false }),
          airplanesActions.setQuery({
            filters: action.payload.filters,
            sort: action.payload.sort,
          })
        ),
        forkJoin({
          page: from(
            queryAirplanesPage({
              cursor: 0,
              limit: INITIAL_LIMIT,
              direction: "down",
              filters: action.payload.filters,
              sort: action.payload.sort,
            })
          ),
          types: from(queryUniqueTypes()),
        }).pipe(
          mergeMap(({ page, types }) =>
            of(
              airplanesActions.applyInitialPage({
                items: [...page.items],
                total: page.total ?? null,
                hasMoreDown: page.hasMore,
                hasMoreUp: page.hasPrev,
                prevCursor: page.prevCursor ?? null,
                nextCursor: page.nextCursor ?? null,
              }),
              airplanesActions.setUniqueTypes(types),
              airplanesActions.clearDirty()
            )
          ),
          catchError((err) => {
            console.error("init failed", err);
            return of(
              airplanesActions.setError("init failed"),
              airplanesActions.setHasMore({ down: false })
            );
          })
        ),
        of(airplanesActions.setLoading({ down: false }))
      )
    )
  );

export const airplanesNextEpic: Epic<AppAction, AppAction, RootState> = (action$, state$) =>
  action$.pipe(
    filter(airplanesNextRequested.match),
    withLatestFrom(state$),
    filter(([_, s]) => sel.hasMore(s).down && !sel.loading(s).down),
    exhaustMap(([action, s]) => {
      const cursor = nextCursorFromState(s);

      return concat(
        of(airplanesActions.setError(null), airplanesActions.setLoading({ down: true })),
        from(
          queryAirplanesPage({
            cursor,
            limit: PAGE_LIMIT,
            direction: "down",
            filters: action.payload.filters,
            sort: action.payload.sort,
          })
        ).pipe(
          map((res) =>
            airplanesActions.appendPage({
              items: [...res.items],
              maxBuffer: MAX_BUFFER,
              hasMoreDown: res.hasMore,
              hasMoreUp: res.hasPrev,
              nextCursor: res.nextCursor ?? null,
              prevCursor: res.prevCursor ?? null,
              total: res.total ?? null,
            })
          ),
          catchError((err) => {
            console.error("next failed", err);
            return of(airplanesActions.setError("next failed"));
          })
        ),
        of(airplanesActions.setLoading({ down: false }))
      );
    })
  );

export const airplanesPrevEpic: Epic<AppAction, AppAction, RootState> = (action$, state$) =>
  action$.pipe(
    filter(airplanesPrevRequested.match),
    withLatestFrom(state$),
    filter(([_, s]) => {
      if (sel.topOffset(s) === 0) return false;
      return sel.hasMore(s).up && !sel.loading(s).up;
    }),
    exhaustMap(([action, s]) => {
      const cursor = prevCursorFromState(s);

      return concat(
        of(airplanesActions.setError(null), airplanesActions.setLoading({ up: true })),
        from(
          queryAirplanesPage({
            cursor,
            limit: PAGE_LIMIT,
            direction: "up",
            filters: action.payload.filters,
            sort: action.payload.sort,
          })
        ).pipe(
          map((res) =>
            airplanesActions.prependPage({
              items: [...res.items],
              maxBuffer: MAX_BUFFER,
              hasMoreUp: res.hasPrev,
              hasMoreDown: res.hasMore,
              prevCursor: res.prevCursor ?? null,
              nextCursor: res.nextCursor ?? null,
              total: res.total ?? null,
            })
          ),
          catchError((err) => {
            console.error("prev failed", err);
            return of(airplanesActions.setError("prev failed"));
          })
        ),
        of(airplanesActions.setLoading({ up: false }))
      );
    })
  );

export const airplanesUpdateEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
  action$.pipe(
    filter(airplanesUpdateRequested.match),
    exhaustMap((action) =>
      from(mutateUpdateAirplane(action.payload)).pipe(
        ignoreElements(),
        catchError((err) => {
          console.error("update failed", err);
          return of(airplanesActions.setError("update failed"));
        })
      )
    )
  );

export const airplanesCreateEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
  action$.pipe(
    filter(airplanesCreateRequested.match),
    exhaustMap((action) =>
      from(mutateCreateAirplane(action.payload)).pipe(
        ignoreElements(),
        catchError((err) => {
          console.error("create failed", err);
          return of(airplanesActions.setError("create failed"));
        })
      )
    )
  );

export const airplanesDeleteEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
  action$.pipe(
    filter(airplanesDeleteRequested.match),
    exhaustMap((action) =>
      from(mutateDeleteAirplane({ id: action.payload.id })).pipe(
        ignoreElements(),
        catchError((err) => {
          console.error("delete failed", err);
          return of(airplanesActions.setError("delete failed"));
        })
      )
    )
  );

export const airplanesSubscriptionEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
  action$.pipe(
    ofType(airplanesSubStart.type),
    switchMap(() =>
      subscribeAirplaneChanges().pipe(
        scan(
          (acc, evt) => ({
            lastV: Math.max(acc.lastV, evt.v),
            evt,
            isNew: evt.v > acc.lastV,
          }),
          { lastV: 0, evt: null as unknown as ChangeEvent, isNew: false }
        ),
        filter((x) => x.isNew),
        map(() => airplanesActions.markDirty()),
        retryWhen((errors) =>
          errors.pipe(
            scan((count, err) => {
              console.error("subscription error", err);
              return count + 1;
            }, 0),
            delay(1000)
          )
        ),
        takeUntil(action$.pipe(ofType(airplanesSubStop.type)))
      )
    )
  );

export const airplanesAutoRefreshEpic: Epic<AppAction, AppAction, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(airplanesActions.markDirty.type),
    debounceTime(600),
    withLatestFrom(state$),
    filter(([, s]) => {
      const isBusy = sel.loading(s).down || sel.loading(s).up;
      const hasQuery = !!s.airplanes.query;
      return hasQuery && !isBusy;
    }),

    map(([, s]) =>
      airplanesInitRequested({
        filters: s.airplanes.query.filters,
        sort: s.airplanes.query.sort,
      })
    )
  );