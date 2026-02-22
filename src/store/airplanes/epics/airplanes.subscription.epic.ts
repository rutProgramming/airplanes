import type { Epic } from "redux-observable";
import { ofType } from "redux-observable";
import {
    debounceTime,
    filter,
    map,
    retry,
    scan,
    switchMap,
    takeUntil,
    withLatestFrom,
} from "rxjs/operators";

import type { RootState } from "../../store";
import { airplanesSubStart, airplanesSubStop, airplanesInitRequested } from "../airplanes.epicActions";
import { airplanesActions } from "../airplanes.slice";
import { subscribeAirplaneChanges } from "../../../api/airplanes.api";
import { sel } from "./airplanes.epics.shared";
import type { AppAction } from "./airplanes.epics.types";
import { timer } from "rxjs/internal/observable/timer";

export const airplanesSubscriptionEpic: Epic<AppAction, AppAction, RootState> = (action$) =>
    action$.pipe(
        ofType(airplanesSubStart.type),
        switchMap(() =>
            subscribeAirplaneChanges().pipe(
                scan(
                    (acc, evt) => ({
                        lastV: Math.max(acc.lastV, evt.v),
                        isNew: evt.v > acc.lastV,
                    }),
                    { lastV: 0, isNew: false }
                ),
                filter((x) => x.isNew),
                map(() => airplanesActions.markDirty()),
                retry({
                    delay: (error, retryCount) => {
                        const backoff = Math.min(1000 * retryCount, 10000);
                        console.error(`subscription retry #${retryCount}`, error);
                        return timer(backoff);
                    },
                }),
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
            const isBusy = sel.loading(s).down || sel.loading(s).up || s.airplanes.refreshInFlight;
            const q = sel.query(s);
            const hasRealQuery = (q.filters?.types?.length ?? 0) > 0 || q.sort !== null;
            return !isBusy && (hasRealQuery || true);
        }),
        map(([, s]) => {
            const q = sel.query(s);
            return airplanesInitRequested({ filters: q.filters, sort: q.sort });
        })
    );