// import { useCallback } from "react";
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../store/store"; 
// import { airplanesUpdateRequested } from "../store/airplanes/airplanes.epicActions";

// export function useAirplanesActions() {
//   const dispatch = useDispatch<AppDispatch>();

//   const updateRow = useCallback((id: string, patch: Record<string, any>) => {
//     dispatch(airplanesUpdateRequested({ id, patch }));
//   }, [dispatch]);

//   return { updateRow };
// }

import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "../store/store"; // adjust path if needed
import { airplanesUpdateRequested } from "../store/airplanes/airplanes.epicActions";

export function useAirplanesActions() {
  const dispatch = useDispatch<AppDispatch>();

  const updateRow = useCallback(
    (id: string, patch: Record<string, any>) => {
      dispatch(airplanesUpdateRequested({ id, patch }));
    },
    [dispatch]
  );

  return { updateRow };
}
