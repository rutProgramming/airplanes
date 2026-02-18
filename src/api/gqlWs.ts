import { createClient, type Client } from "graphql-ws";

export function createGraphqlWsClient(opts: { url: string }): Client {
  return createClient({
    url: opts.url,
    lazy: true,
    retryAttempts: 0,
  });
}

export function subscribe<
  TData,
  TVars extends Record<string, unknown> = Record<string, never>
>(
  client: Client,
  args: { query: string; variables?: TVars },
  handlers: { onData: (data: TData) => void; onError?: (err: unknown) => void }
) {
  return client.subscribe<TData>(args, {
    next: (v) => v.data && handlers.onData(v.data),
    error: handlers.onError||console.error,
    complete: () => {},
  });
}
