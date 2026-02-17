import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "../store/store";
import { airplanesDeleteRequested, airplanesUpdateRequested, airplanesCreateRequested } from "../store/airplanes/airplanes.epicActions";
import type { AirplaneInput } from "../generated/graphql";

export function useAirplanesActions() {
  const dispatch = useDispatch<AppDispatch>();

  const updateRow = useCallback(
    (draftRow: AirplaneInput) => {
      dispatch(airplanesUpdateRequested({ input: draftRow }));
    },
    [dispatch]
  );

  const createRow = useCallback(
    (draftRow: AirplaneInput) => {
      dispatch(airplanesCreateRequested({ input: draftRow }));
    },
    [dispatch]
  );

  const deleteRow = useCallback((id: string) => {
    dispatch(airplanesDeleteRequested({ id }));
  },
    [dispatch]
  );

  return { updateRow, createRow, deleteRow };
}
