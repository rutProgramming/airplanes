import { createAction } from "@reduxjs/toolkit";
import type { Filters } from "../../types/Filters";
import type { Sort } from "../../types/Sort";
import type { AirplaneInput } from "../../generated/graphql";

export const airplanesInitRequested = createAction<{ filters: Filters; sort: Sort | null }>(
  "airplanes/initRequested"
);

export const airplanesNextRequested = createAction<{ filters: Filters; sort: Sort | null }>(
  "airplanes/nextRequested"
);

export const airplanesPrevRequested = createAction<{ filters: Filters; sort: Sort | null }>(
  "airplanes/prevRequested"
);

export const airplanesUpdateRequested = createAction<{ input:AirplaneInput }>(
  "airplanes/updateRequested"
);
export const airplanesCreateRequested = createAction<{ input:AirplaneInput }>(
  "airplanes/createRequested"
);
export const airplanesDeleteRequested = createAction<{ id: string}>(
  "airplanes/deleteRequested"
);

export const airplanesSubStart = createAction("airplanes/subscriptionStart");
export const airplanesSubStop = createAction("airplanes/subscriptionStop");
