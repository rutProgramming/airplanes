export type GraphQLError = { message: string };
export type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

export function createGraphqlHttpClient(opts: { url: string }) {
  return async function request<TData, TVars extends Record<string, any> | undefined>(
    query: string,
    variables?: TVars
  ): Promise<TData> {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) throw new Error(`GraphQL HTTP error: ${res.status}`);

    const json = (await res.json()) as GraphQLResponse<TData>;
    console.log(json);
    
    if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join("\n"));
    if (!json.data) throw new Error("GraphQL response missing data");
    return json.data;
  };
}
