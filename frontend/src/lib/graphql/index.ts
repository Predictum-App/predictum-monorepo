export * from "./queries";

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";

const httpLink = new HttpLink({
  uri: process.env.SUBGRAPH_URL,
  fetch: function (uri, options) {
    return fetch(uri, {
      ...(options ?? {}),
      headers: {
        ...(options?.headers ?? {}),
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      next: {
        revalidate: 0,
      },
    });
  },
});

let client: ApolloClient<NormalizedCacheObject>;
const createApolloClient = () => {
  if (client) {
    return client;
  } else {
    client = new ApolloClient({
      cache: new InMemoryCache({
        addTypename: true,
      }),
      link: ApolloLink.from([httpLink]),
      defaultOptions: {
        query: {
          fetchPolicy: "no-cache",
          errorPolicy: "all",
        },
        watchQuery: {
          fetchPolicy: "no-cache",
          errorPolicy: "all",
        },
      },
    });
    return client;
  }
};

export default createApolloClient;
