import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

export function createGraphqlHttpClient(opts: { url: string }) {
  return async function request<TData, TVars>(
    document: TypedDocumentNode<TData, TVars>,
    variables: TVars
  ): Promise<TData> {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: print(document), variables }),
    });

    const json = (await res.json()) as { data?: TData; errors?: { message: string }[] };
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("\n"));
    if (!json.data) throw new Error("GraphQL response missing data");
    return json.data;
  };
}
