import type { Data } from "../../types/Data";
import { createBoundedEntitySlice } from "../boundedEntitySliceFactory";

export const airplanesSlice = createBoundedEntitySlice<Data, string>({
  name: "airplanes",
  selectId: (a) => a.id,
});

export const airplanesActions = airplanesSlice.actions;
