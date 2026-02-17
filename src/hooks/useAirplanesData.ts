import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";
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

  const bufferLen = bufferIds.length;

  const canLoadNext =
    hasMore.down &&
    !loading.down &&
    (totalCount == null ? true : topOffset + bufferLen < totalCount);

  const canLoadPrev = topOffset > 0 && hasMore.up && !loading.up;

  const rows = useMemo(() => {
    return bufferIds.map((id) => entities[id]).filter(Boolean);
  }, [bufferIds, entities]);

  useEffect(() => {
    dispatch(airplanesSubStart());
    return () => {
      dispatch(airplanesSubStop());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(airplanesInitRequested({ filters: args.filters, sort: args.sort }));
  }, [dispatch, args.filters, args.sort]);

  const loadNext = useCallback(() => {
    dispatch(airplanesNextRequested({ filters: args.filters, sort: args.sort }));
  }, [dispatch, args.filters, args.sort]);

  const loadPrev = useCallback(() => {
    dispatch(airplanesPrevRequested({ filters: args.filters, sort: args.sort }));
  }, [dispatch, args.filters, args.sort]);

  return { rows, loading, totalCount, topOffset, loadNext, loadPrev, canLoadNext, canLoadPrev };
}
