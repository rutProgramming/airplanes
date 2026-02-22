import { airplanesInitEpic } from "./airplanes.init.epic";
import { airplanesNextEpic, airplanesPrevEpic } from "./airplanes.paging.epic";
import { airplanesUpdateEpic, airplanesCreateEpic, airplanesDeleteEpic } from "./airplanes.mutations.epic";
import { airplanesSubscriptionEpic, airplanesAutoRefreshEpic } from "./airplanes.subscription.epic";

export const airplanesEpics = [
  airplanesInitEpic,
  airplanesNextEpic,
  airplanesPrevEpic,
  airplanesUpdateEpic,
  airplanesCreateEpic,
  airplanesDeleteEpic,
  airplanesSubscriptionEpic,
  airplanesAutoRefreshEpic,
] as const;