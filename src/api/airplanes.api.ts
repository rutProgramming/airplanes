export type PageResponse = {
  items: Airplane[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  hasPrev: boolean;
  total: number;
};

export type ChangeEvent =
  | { op: "update"; item: Airplane }
  | { op: "create"; item: Airplane }
  | { op: "remove"; id: string };


import { Observable } from "rxjs";
import { createGraphqlHttpClient } from "./gqlHttp";
import { createGraphqlWsClient, subscribe } from "./gqlWs";

import {
  AirplanesPageDocument,
  CreateAirplaneDocument,
  UpdateAirplaneDocument,
  RemoveAirplaneDocument,
  AirplaneChangedDocument,
  type AirplanesPageQuery,
  type AirplanesPageQueryVariables,
  type CreateAirplaneMutation,
  type CreateAirplaneMutationVariables,
  type UpdateAirplaneMutation,
  type UpdateAirplaneMutationVariables,
  type RemoveAirplaneMutation,
  type RemoveAirplaneMutationVariables,
  type AirplaneChangedSubscription,
  type Airplane,
  UniqueTypesDocument,
  type UniqueTypesQuery,
} from "../generated/graphql";
import { print } from "graphql";

const http = createGraphqlHttpClient({ url: "/graphql" });
const wsClient = createGraphqlWsClient({ url: "ws://localhost:4000/graphql" });

export async function queryAirplanesPage(vars: AirplanesPageQueryVariables) {
  const data = await http(AirplanesPageDocument, vars);
  return (data as AirplanesPageQuery).airplanesPage;
}

export async function mutateCreateAirplane(vars: CreateAirplaneMutationVariables) {
  const data = await http(CreateAirplaneDocument, vars);
  return (data as CreateAirplaneMutation).createAirplane;
}

export async function mutateUpdateAirplane(vars: UpdateAirplaneMutationVariables) {
  const data = await http(UpdateAirplaneDocument, vars);
  return (data as UpdateAirplaneMutation).updateAirplane;
}

export async function mutateDeleteAirplane(vars: RemoveAirplaneMutationVariables) {
  const data = await http(RemoveAirplaneDocument, vars);
  return (data as RemoveAirplaneMutation).removeAirplane;
}

export function subscribeAirplaneChanges(): Observable<ChangeEvent> {
  return new Observable<ChangeEvent>((observer) => {
    const dispose = subscribe<AirplaneChangedSubscription>(
      wsClient,
      { query: print(AirplaneChangedDocument) },
      {
        onData: (data) => {
          const evt = data.airplaneChanged;
          if (!evt) return;

          if (evt.op === "create" && evt.item) observer.next({ op: "create", item: evt.item });
          else if (evt.op === "update" && evt.item) observer.next({ op: "update", item: evt.item });
          else if (evt.op === "remove" && evt.id) observer.next({ op: "remove", id: evt.id });
        },
        onError: (err) => observer.error(err),
      }
    );

    return () => {
      try { dispose(); } catch {}
    };
  });
}
export async function queryUniqueTypes(): Promise<string[]> {
  const data = await http(UniqueTypesDocument, {});
  return [...(data as UniqueTypesQuery).uniqueTypes];
}
