import { ViewCache } from "../routers/airplanes.router";


const cache: ViewCache = {
  filters: null,
  filtered: null,
  sort: null,
  sorted: null
};

export const getCache = (): ViewCache => cache;

export const setCache = (next: Partial<ViewCache>): void => {
  Object.assign(cache, next);
};
