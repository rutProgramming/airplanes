import { Observable } from "rxjs";
import type { Data } from "../types/Data";
import { createGraphqlHttpClient } from "./gqlHttp";
import { createGraphqlWsClient, subscribe } from "./gqlWs";
import type { AirplaneChangedSubscription, AirplanesPage, AirplanesPageQueryVariables, UpsertAirplaneMutation, UpsertAirplaneMutationVariables } from "../generated/graphql";

export type PageResponse = {
  items: Data[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  hasPrev: boolean;
  total: number;
};

export type ChangeEvent =
  | { op: "upsert"; item: Data }
  | { op: "remove"; id: string };

const http = createGraphqlHttpClient({ url: "/graphql" });
const wsClient = createGraphqlWsClient({ url: "ws://localhost:4000/graphql" });


const PAGE_QUERY = `
  query AirplanesPage(
    $cursor: Int!
    $limit: Int!
    $direction: Direction!
    $filters: FiltersInput
    $sort: SortInput
  ) {
    airplanesPage(
      cursor: $cursor
      limit: $limit
      direction: $direction
      filters: $filters
      sort: $sort
    ) {
      total
      nextCursor
      prevCursor
      hasMore
      hasPrev
      items {
        id
        type
        capacity
        size
      }
    }
  }
`;


export async function queryAirplanesPage(vars: AirplanesPageQueryVariables): Promise<AirplanesPage> {
  type Resp = { airplanesPage: AirplanesPage };
  const data = await http<Resp, AirplanesPageQueryVariables>(PAGE_QUERY, vars);
  return data.airplanesPage;
}

const UPSERT_MUTATION =`
  mutation UpsertAirplane($input: AirplaneInput!) {
    upsertAirplane(input: $input) {
      id
      type
      capacity
      size
    }
  }
`;


export async function mutateUpdateAirplane(vars: UpsertAirplaneMutationVariables): Promise<UpsertAirplaneMutation["upsertAirplane"]> {
  type Resp = UpsertAirplaneMutation;
  const data = await http<Resp, UpsertAirplaneMutationVariables>(UPSERT_MUTATION, vars);
  return data.upsertAirplane;
}

const REMOVE_MUTATION = `
  mutation RemoveAirplane($id: ID!) {
    removeAirplane(id: $id)
  }
`;

export async function mutateRemoveAirplane(vars: { id: string }): Promise<boolean> {
  type Resp = { removeAirplane: boolean };
  const data = await http<Resp, { id: string }>(REMOVE_MUTATION, vars);
  return data.removeAirplane;
}

const CHANGES_SUB = `
  subscription AirplaneChanged {
    airplaneChanged {
      op
      id
      item {
        id
        type
        capacity
        size
      }
    }
  }
`;

export function subscribeAirplaneChanges(): Observable<ChangeEvent> {
  return new Observable<ChangeEvent>((observer) => {
    const dispose = subscribe<
    { airplaneChanged: AirplaneChangedSubscription["airplaneChanged"] },Record<string, any>
>(
      wsClient,
      { query: CHANGES_SUB, variables: {} },
      {
        onData: (data) => {
          const evt = data.airplaneChanged;

          if (evt.op === "upsert" && evt.item) {
            observer.next({ op: "upsert", item: evt.item });
            return;
          }
          if ((evt.op === "remove" || evt.op === "delete") && evt.id) {
            observer.next({ op: "remove", id: evt.id });
            return;
          }
        },
        onError: (err) => observer.error(err),
      }
    );

    return () => {
      try {
        dispose();
      } catch {}
    };
  });
}



const UNIQUE_TYPES = `
  query UniqueTypes { uniqueTypes }
`;

export async function queryUniqueTypes(): Promise<string[]> {
  const data = await http<{ uniqueTypes: string[] }, {}>(UNIQUE_TYPES, {});
  return data.uniqueTypes;
}
