import type { Epic } from "redux-observable";
import { concat, forkJoin, from, of } from "rxjs";
import { catchError, filter, mergeMap, switchMap } from "rxjs/operators";

import type { RootState } from "../../store";
import { airplanesInitRequested } from "../airplanes.epicActions";
import { airplanesActions } from "../airplanes.slice";
import { queryAirplanesPage, queryUniqueTypes } from "../../../api/airplanes.api";
import { INITIAL_LIMIT } from "./airplanes.epics.shared";
import type { AppAction } from "./airplanes.epics.types";

export const airplanesInitEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
  action$.pipe(
    filter(airplanesInitRequested.match),
    switchMap((action) =>
      concat(
        of(
          airplanesActions.setError(null),
          airplanesActions.setLoading({ down: true, up: false }),
          airplanesActions.setQuery({ filters: action.payload.filters, sort: action.payload.sort })
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