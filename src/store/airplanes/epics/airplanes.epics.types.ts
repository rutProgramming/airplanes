import type {
  airplanesInitRequested,
  airplanesNextRequested,
  airplanesPrevRequested,
  airplanesUpdateRequested,
  airplanesCreateRequested,
  airplanesDeleteRequested,
  airplanesSubStart,
  airplanesSubStop,
} from "../airplanes.epicActions";

import { airplanesActions } from "../airplanes.slice";

export type AirplanesInActions =
  | ReturnType<typeof airplanesInitRequested>
  | ReturnType<typeof airplanesNextRequested>
  | ReturnType<typeof airplanesPrevRequested>
  | ReturnType<typeof airplanesUpdateRequested>
  | ReturnType<typeof airplanesCreateRequested>
  | ReturnType<typeof airplanesDeleteRequested>
  | ReturnType<typeof airplanesSubStart>
  | ReturnType<typeof airplanesSubStop>;

export type AirplanesOutActions =
  | ReturnType<typeof airplanesActions.setLoading>
  | ReturnType<typeof airplanesActions.setHasMore>
  | ReturnType<typeof airplanesActions.setTotalCount>
  | ReturnType<typeof airplanesActions.resetView>
  | ReturnType<typeof airplanesActions.applyInitialPage>
  | ReturnType<typeof airplanesActions.appendPage>
  | ReturnType<typeof airplanesActions.prependPage>
  | ReturnType<typeof airplanesActions.removeManyFromServer>
  | ReturnType<typeof airplanesActions.setError>
  | ReturnType<typeof airplanesActions.markDirty>
  | ReturnType<typeof airplanesActions.clearDirty>
  | ReturnType<typeof airplanesActions.setUniqueTypes>
  | ReturnType<typeof airplanesActions.setQuery>
  | ReturnType<typeof airplanesActions.setRefreshInFlight>;

export type AppAction = AirplanesInActions | AirplanesOutActions;