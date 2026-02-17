import { Observable } from "rxjs";
import type { Data } from "../types/Data";
import { createGraphqlHttpClient } from "./gqlHttp";
import { createGraphqlWsClient, subscribe } from "./gqlWs";
import type { AirplaneChangedSubscription, AirplanesPage, AirplanesPageQueryVariables, CreateAirplaneMutation, CreateAirplaneMutationVariables, RemoveAirplaneMutation, RemoveAirplaneMutationVariables, UpdateAirplaneMutation, UpdateAirplaneMutationVariables } from "../generated/graphql";

export type PageResponse = {
  items: Data[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  hasPrev: boolean;
  total: number;
};

export type ChangeEvent =
  | { op: "update"; item: Data }
  | { op: "create"; item: Data }
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



const CREATE_MUTATION = `
  mutation CreateAirplane($input: AirplaneInput!) {
    createAirplane(input: $input) {
      id
      type
      capacity
      size
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateAirplane($input: AirplaneInput!) {
    updateAirplane(input: $input) {
      id
      type
      capacity
      size
    }
  }
`;

const DELETE_MUTATION = `
  mutation RemoveAirplane($id: ID!) {
    removeAirplane(id: $id)
  }
`;

export async function mutateCreateAirplane(
  vars: CreateAirplaneMutationVariables
): Promise<CreateAirplaneMutation["createAirplane"]> {
  const data = await http<CreateAirplaneMutation, CreateAirplaneMutationVariables>(
    CREATE_MUTATION,
    vars
  );
  return data.createAirplane;
}

export async function mutateUpdateAirplane(
  vars: UpdateAirplaneMutationVariables
): Promise<UpdateAirplaneMutation["updateAirplane"]> {
  const data = await http<UpdateAirplaneMutation, UpdateAirplaneMutationVariables>(
    UPDATE_MUTATION,
    vars
  );
  return data.updateAirplane;
}
export async function mutateDeleteAirplane(
  vars: RemoveAirplaneMutationVariables
): Promise<RemoveAirplaneMutation["removeAirplane"]> {
  const data = await http<RemoveAirplaneMutation, RemoveAirplaneMutationVariables>(
    DELETE_MUTATION,
    vars
  );
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
      { airplaneChanged: AirplaneChangedSubscription["airplaneChanged"] }, Record<string, any>
    >(
      wsClient,
      { query: CHANGES_SUB, variables: {} },
      {
        onData: (data) => {
          const evt = data.airplaneChanged;
          if (!evt) return;

          if (evt.op === "create" && evt.item) {
            observer.next({ op: "create", item: evt.item });
            return;
          }

          if (evt.op === "update" && evt.item) {
            observer.next({ op: "update", item: evt.item });
            return;
          }

          if (evt.op === "delete" && evt.id) {
            observer.next({ op: "remove", id: evt.id });
            return;
          }
        }
        ,
        onError: (err) => observer.error(err),
      }
    );

    return () => {
      try {
        dispose();
      } catch { }
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
