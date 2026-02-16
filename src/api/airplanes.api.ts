import { Observable } from "rxjs";
import type { Data } from "../types/Data";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";
import { createGraphqlHttpClient } from "./gqlHttp";
import { createGraphqlWsClient, subscribe } from "./gqlWs";

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


const PAGE_QUERY = /* GraphQL */ `
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

export async function queryAirplanesPage(vars: {
  cursor: number;
  limit: number;
  direction: "down" | "up";
  filters: Filters;
  sort: Sort | null;
}): Promise<PageResponse> {
  type Resp = { airplanesPage: PageResponse };

  const data = await http<Resp, any>(PAGE_QUERY, {
    cursor: vars.cursor,
    limit: vars.limit,
    direction: vars.direction,
    filters: vars.filters,
    sort: vars.sort,
  });

  return data.airplanesPage;
}

const UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateAirplane($id: ID!, $patch: JSON!) {
    updateAirplane(id: $id, patch: $patch) {
      id
      type
      capacity
      size
    }
  }
`;

export async function mutateUpdateAirplane(vars: {
  id: string;
  patch: Record<string, any>;
}): Promise<Data> {
  type Resp = { updateAirplane: Data };
  const data = await http<Resp, typeof vars>(UPDATE_MUTATION, vars);
  return data.updateAirplane;
}

const CHANGES_SUB = /* GraphQL */ `
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
      { airplaneChanged: { op: string; id?: string | null; item?: Data | null } },
      Record<string, any>
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
