import { ofType, type Epic } from "redux-observable";
import { concat, from, of } from "rxjs";
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  map,
  retryWhen,
  scan,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs/operators";

import type { RootState } from "../store";
import {
  airplanesInitRequested,
  airplanesNextRequested,
  airplanesPrevRequested,
  airplanesUpdateRequested,
  airplanesSubStart,
  airplanesSubStop,
} from "./airplanes.epicActions";
import { mutateUpdateAirplane, queryAirplanesPage, subscribeAirplaneChanges } from "../../api/airplanes.api";
import { airplanesActions } from "./airplanes.slice";


const INITIAL_LIMIT = 7;
const PAGE_LIMIT = 20;
const MAX_BUFFER = 200;

const sel = {
  cursors: (s: RootState) => s.airplanes.cursors,
  hasMore: (s: RootState) => s.airplanes.hasMore,
  loading: (s: RootState) => s.airplanes.loading,
};

export const airplanesInitEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType(airplanesInitRequested.type),
    exhaustMap((action: ReturnType<typeof airplanesInitRequested>) =>
      concat(
        of(airplanesActions.setLoading({ down: true, up: false })),
        from(
          queryAirplanesPage({
            cursor: 0,
            limit: INITIAL_LIMIT,
            direction: "down",
            filters: action.payload.filters,
            sort: action.payload.sort,
          })
        ).pipe(
          map((res) =>
            airplanesActions.applyInitialPage({
              items: res.items,
              total: res.total ?? null,
              hasMoreDown: res.hasMore,
              hasMoreUp: res.hasPrev,
              prevCursor: res.prevCursor,
              nextCursor: res.nextCursor,
            })
          ),

          catchError((err) => {
            console.error("init failed", err);
            return of(airplanesActions.setHasMore({ down: false }));
          })
        ),
        of(airplanesActions.setLoading({ down: false }))
      )
    )
  );

export const airplanesNextEpic: Epic<any, any, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(airplanesNextRequested.type),
    withLatestFrom(state$),
    filter(([, s]) => {
      const { next } = sel.cursors(s);
      return sel.hasMore(s).down && next !== null && !sel.loading(s).down;
    }),
    exhaustMap(([action, s]: [ReturnType<typeof airplanesNextRequested>, RootState]) =>
      concat(
        of(airplanesActions.setLoading({ down: true })),
        from(
          queryAirplanesPage({
            cursor: sel.cursors(s).next!,
            limit: PAGE_LIMIT,
            direction: "down",
            filters: action.payload.filters,
            sort: action.payload.sort,
          })
        ).pipe(
          map((res) =>
            airplanesActions.appendPage({
              items: res.items,
              maxBuffer: MAX_BUFFER,
              hasMoreDown: res.hasMore,
              hasMoreUp: res.hasPrev,
              nextCursor: res.nextCursor,
              prevCursor: res.prevCursor,
              total: res.total ?? null,
            })
          ),

          catchError((err) => {
            console.error("next failed", err);
            return of(airplanesActions.setLoading({ down: false }));
          })
        ),
        of(airplanesActions.setLoading({ down: false }))
      )
    )
  );

export const airplanesPrevEpic: Epic<any, any, RootState> = (action$, state$) =>
  action$.pipe(
    ofType(airplanesPrevRequested.type),
    withLatestFrom(state$),
    filter(([, s]) => {
      const { prev } = sel.cursors(s);
      return sel.hasMore(s).up && prev !== null && !sel.loading(s).up;
    }),
    exhaustMap(([action, s]: [ReturnType<typeof airplanesPrevRequested>, RootState]) =>
      concat(
        of(airplanesActions.setLoading({ up: true })),
        from(
          queryAirplanesPage({
            cursor: sel.cursors(s).prev!,
            limit: PAGE_LIMIT,
            direction: "up",
            filters: action.payload.filters,
            sort: action.payload.sort,
          })
        ).pipe(
          map((res) =>
            airplanesActions.prependPage({
              items: res.items,
              maxBuffer: MAX_BUFFER,
              hasMoreUp: res.hasPrev,
              hasMoreDown: res.hasMore,
              prevCursor: res.prevCursor,
              nextCursor: res.nextCursor,
              total: res.total ?? null,
            })
          ),

          catchError((err) => {
            console.error("prev failed", err);
            return of(airplanesActions.setLoading({ up: false }));
          })
        ),
        of(airplanesActions.setLoading({ up: false }))
      )
    )
  );

export const airplanesUpdateEpic: Epic<any, any, RootState> = (action$) =>
  action$.pipe(
    ofType(airplanesUpdateRequested.type),
    exhaustMap((action: ReturnType<typeof airplanesUpdateRequested>) =>
      from(mutateUpdateAirplane(action.payload)).pipe(
        map((item) => airplanesActions.upsertFromServer(item)),
        catchError((err) => {
          console.error("update failed", err);
          return of(airplanesActions.setLoading({}));
        })
      )
    )
  );

export const airplanesSubscriptionEpic: Epic = (action$) =>
  action$.pipe(
    ofType(airplanesSubStart.type),
    switchMap(() =>
      subscribeAirplaneChanges().pipe(
        map((evt) =>
          evt.op === "upsert"
            ? airplanesActions.upsertFromServer(evt.item)
            : airplanesActions.removeFromServer({ id: evt.id })
        ),
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
