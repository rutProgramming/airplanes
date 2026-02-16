import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store"
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";
import { airplanesSlice } from "../store/airplanes/airplanes.slice";
import {
  airplanesInitRequested,
  airplanesNextRequested,
  airplanesPrevRequested,
  airplanesSubStart,
  airplanesSubStop,
} from "../store/airplanes/airplanes.epicActions";

export function useAirplanesData(args: { filters: Filters; sort: Sort | null }) {
  const dispatch = useDispatch<AppDispatch>();

  const bufferIds = useSelector((s: RootState) => s.airplanes.bufferIds);
  const entities = useSelector((s: RootState) => s.airplanes.entities);

  const loading = useSelector((s: RootState) => s.airplanes.loading);
  const hasMore = useSelector((s: RootState) => s.airplanes.hasMore);
  const totalCount = useSelector((s: RootState) => s.airplanes.totalCount);
  const topOffset = useSelector((s: RootState) => s.airplanes.topOffset);

  const rows = useMemo(() => {
    return bufferIds.map((id) => entities[id]!).filter(Boolean);
  }, [bufferIds, entities]);

  useEffect(() => {
    dispatch(airplanesSlice.actions.resetView());
    dispatch(airplanesInitRequested({ filters: args.filters, sort: args.sort }));
  }, [dispatch, args.filters, args.sort]);

  useEffect(() => {
    dispatch(airplanesSubStart());
    return () => {
      dispatch(airplanesSubStop());
    };
  }, [dispatch]);

  const loadNext = useCallback(() => {
    dispatch(airplanesNextRequested({ filters: args.filters, sort: args.sort }));
  }, [dispatch, args.filters, args.sort]);

  const loadPrev = useCallback(() => {
    dispatch(airplanesPrevRequested({ filters: args.filters, sort: args.sort }));
  }, [dispatch, args.filters, args.sort]);

  return {
    rows,
    loading,
    hasMore,
    totalCount,
    topOffset,
    loadNext,
    loadPrev,
  };
}
