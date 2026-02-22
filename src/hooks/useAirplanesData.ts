import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {AppDispatch } from "../store/store";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";
import {
  airplanesInitRequested,
  airplanesNextRequested,
  airplanesPrevRequested,
  airplanesSubStart,
  airplanesSubStop,
} from "../store/airplanes/airplanes.epicActions";
import {selectBufferIds, selectEntities, selectHasMore, selectLoading, selectTopOffset, selectTotal, selectUniqueTypes } from "../store/airplanes/airplanes.selectors";

export function useAirplanesData(args: { filters: Filters; sort: Sort | null }) {
  const dispatch = useDispatch<AppDispatch>();

  const bufferIds = useSelector(selectBufferIds);
  const entities = useSelector(selectEntities);
  const loading = useSelector(selectLoading);
  const hasMore = useSelector(selectHasMore);
  const totalCount = useSelector(selectTotal);
  const topOffset = useSelector(selectTopOffset);
  const uniqueTypes = useSelector(selectUniqueTypes);
  const bufferLen = bufferIds.length;
  

  const canLoadNext =
    hasMore.down &&
    !loading.down &&
    (totalCount == null ? true : topOffset + bufferLen < totalCount);

  const canLoadPrev = topOffset > 0 && hasMore.up && !loading.up;

  const rows = 
  useMemo(() => {
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

  return { rows, loading, totalCount, topOffset, loadNext, loadPrev, canLoadNext, canLoadPrev,uniqueTypes };
}
