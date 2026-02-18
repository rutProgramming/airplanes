import type { Airplane } from "../../generated/graphql";
import { createBoundedEntitySlice } from "../boundedEntitySliceFactory";

export const airplanesSlice = createBoundedEntitySlice<Airplane, string>({
  name: "airplanes",
  selectId: (a) => a.id,
});

export const airplanesActions = airplanesSlice.actions;
