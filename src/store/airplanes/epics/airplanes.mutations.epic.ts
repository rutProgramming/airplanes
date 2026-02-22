import type { Epic } from "redux-observable";
import { from, of } from "rxjs";
import { catchError, exhaustMap, filter, ignoreElements } from "rxjs/operators";

import type { RootState } from "../../store";
import {
  airplanesUpdateRequested,
  airplanesCreateRequested,
  airplanesDeleteRequested,
} from "../airplanes.epicActions";
import { airplanesActions } from "../airplanes.slice";
import {
  mutateUpdateAirplane,
  mutateCreateAirplane,
  mutateDeleteAirplane,
} from "../../../api/airplanes.api";
import type { AppAction } from "./airplanes.epics.types";

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