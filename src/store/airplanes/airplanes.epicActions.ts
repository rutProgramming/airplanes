import { createAction } from "@reduxjs/toolkit";
import type { Filters } from "../../types/Filters";
import type { Sort } from "../../types/Sort";

export const airplanesInitRequested = createAction<{ filters: Filters; sort: Sort | null }>(
  "airplanes/initRequested"
);

export const airplanesNextRequested = createAction<{ filters: Filters; sort: Sort | null }>(
  "airplanes/nextRequested"
);

export const airplanesPrevRequested = createAction<{ filters: Filters; sort: Sort | null }>(
  "airplanes/prevRequested"
);

export const airplanesUpdateRequested = createAction<{ id: string; patch: Record<string, any> }>(
  "airplanes/updateRequested"
);
export const airplanesDeleteRequested = createAction<{ id: string}>(
  "airplanes/deleteRequested"
);

export const airplanesSubStart = createAction("airplanes/subscriptionStart");
export const airplanesSubStop = createAction("airplanes/subscriptionStop");
