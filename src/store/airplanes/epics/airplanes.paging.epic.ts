import type { Epic } from "redux-observable";
import { concat, from, of } from "rxjs";
import { catchError, exhaustMap, filter, map, withLatestFrom } from "rxjs/operators";

import type { RootState } from "../../store";
import { airplanesNextRequested, airplanesPrevRequested } from "../airplanes.epicActions";
import { airplanesActions } from "../airplanes.slice";
import { queryAirplanesPage } from "../../../api/airplanes.api";

import { PAGE_LIMIT, MAX_BUFFER, sel, nextCursorFromState, prevCursorFromState } from "./airplanes.epics.shared";
import type { AppAction } from "./airplanes.epics.types";

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