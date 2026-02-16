import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "../store/store";
import { airplanesDeleteRequested, airplanesUpdateRequested } from "../store/airplanes/airplanes.epicActions";

export function useAirplanesActions() {
  const dispatch = useDispatch<AppDispatch>();

  const updateRow = useCallback(
    (id: string, patch: Record<string, any>) => {
      dispatch(airplanesUpdateRequested({ id, patch }));
    },
    [dispatch]
  );

  const deleteRow = useCallback((id: string) => {
    dispatch(airplanesDeleteRequested({ id }));
  },
    [dispatch]
  );

  return { updateRow };
}
