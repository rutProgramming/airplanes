import { Observable } from "rxjs";
import type { Data } from "../types/Data";
import { createGraphqlHttpClient } from "./gqlHttp";
import { createGraphqlWsClient, subscribe } from "./gqlWs";
import type { Filters } from "../types/Filters";
import type { Sort } from "../types/Sort";

export type PageResponse = {
  items: Data[];
  nextCursor: number | null;
  prevCursor: number | null;
  hasMore: boolean;
  total: number;
};

export type ChangeEvent =
  | { op: "upsert"; entity: "airplane"; item: Data; ts: number }
  | { op: "delete"; entity: "airplane"; id: string; ts: number };

const http = createGraphqlHttpClient({ url: "/graphql" });
const wsClient = createGraphqlWsClient({ url: "ws://localhost:4000/graphql" }); // תעדכני

// TODO: לשנות ל-query שלכם בפועל
const PAGE_QUERY = /* GraphQL */ `
  query AirplanesPage($cursor: Int!, $limit: Int!, $direction: String!, $filters: JSON!, $sort: JSON) {
    airplanesPage(cursor: $cursor, limit: $limit, direction: $direction, filters: $filters, sort: $sort) {
      items { id type capacity size }
      nextCursor
      prevCursor
      hasMore
      total
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
  const data = await http<Resp, typeof vars>(PAGE_QUERY, vars);
  return data.airplanesPage;
}

// TODO: mutation שלכם
const UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateAirplane($id: ID!, $patch: JSON!) {
    updateAirplane(id: $id, patch: $patch) { id type capacity size }
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

// TODO: subscription שלכם
const CHANGES_SUB = /* GraphQL */ `
  subscription AirplaneChanged {
    airplaneChanged {
      op
      entity
      ts
      item { id type capacity size }
      id
    }
  }
`;
export function subscribeAirplaneChanges(): Observable<ChangeEvent> {
  return new Observable<ChangeEvent>((observer) => {
    const dispose = subscribe<{ airplaneChanged: ChangeEvent }, Record<string, any>>(
      wsClient,
      { query: CHANGES_SUB, variables: {} },
      {
        onData: (data: { airplaneChanged: ChangeEvent }) => {
          observer.next(data.airplaneChanged);
        },
        onError: (err: unknown) => observer.error(err),
      }
    );

    return () => {
      try {
        dispose();
      } catch {
        // ignore
      }
    };
  });
}
