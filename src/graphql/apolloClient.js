import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from "@apollo/client/link/context";

import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { ApolloProvider, ApolloClient, split } from "@apollo/client";

const GRAPHQL_ENDPOINT = "ws:test-323.herokuapp.com/v1/graphql";
const graphlToken =
  "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im1xTFFXMDlNTUxRMUNNZGJpV3cwSyJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS1hbGxvd2VkLXJvbGVzIjpbInVzZXIiXSwieC1oYXN1cmEtdXNlci1pZCI6Imdvb2dsZS1vYXV0aDJ8MTAzMjgyMTUzNDY1MzMwNTI3ODU1In0sImdpdmVuX25hbWUiOiJkaXB0aSIsImZhbWlseV9uYW1lIjoiZ2FuZGhpIiwibmlja25hbWUiOiJnYW5kaGlkaXB0aS5zIiwibmFtZSI6ImRpcHRpIGdhbmRoaSIsInBpY3R1cmUiOiJodHRwczovL2xoNS5nb29nbGV1c2VyY29udGVudC5jb20vLVdieVBvaHhzR2lvL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y21PdmZ5ajVqOXgtckpzZEdQWWd5dENVVjRteGcvcGhvdG8uanBnIiwibG9jYWxlIjoiZW4tR0IiLCJ1cGRhdGVkX2F0IjoiMjAyMC0wNy0yMVQxMToxMDowNi43ODVaIiwiaXNzIjoiaHR0cHM6Ly90ZXN0LTMyMy51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDMyODIxNTM0NjUzMzA1Mjc4NTUiLCJhdWQiOiJNclVTM3NZTEpUU1paMzJpUjN4OUhwQWJ3MzlWVVJVaCIsImlhdCI6MTU5NTMyOTgwNywiZXhwIjoxNTk1MzY1ODA3LCJhdF9oYXNoIjoibU5YcWstUnNva3dWWUhqckpEdXZlZyIsIm5vbmNlIjoiUm9nelp0VDI5Nl9CMWV5ajVtZkxETXNka0xTaDdSUnUifQ.3KuVHbvAmox0mCardE7QpsY6e6vIlRydW9JbjLiqsLdSTWEvaO58UG1TtIvXpV_Bg_Gno1nqngPJKMon9tG02-l-SkdUYSjnW2eCeLhMsI8DMsWYo3eHxRU4LDWynbkmC-1h5zzLhxyt0dS26ebqhE6CMkOaO4om5reLtHCOcn8qiTI468IEd92NJMQqvgNrjbSUSuXp0kO6g-OE3npc77uPSxbWdrcVLltnRXlrYSJEX-6fmLjQAQdptflO9LtJV2zZta1I8pub33hZtXx4CAKIO_zBANaEYRnjF181jDDC53aRLr_5qBZ_hNUGBusu85imNnfmxkDUebpFV9oInA";

const wsLink = new WebSocketLink(
  new SubscriptionClient(GRAPHQL_ENDPOINT, {
    reconnect: true,

    connectionParams: {
      headers: {
        Authorization: graphlToken,
      },
    },
  })
);
// 2
const httpLink = createHttpLink({
  uri: "https://test-323.herokuapp.com/v1/graphql",
  credentials: "include",
});
console.log("subcriptionclinet", wsLink, httpLink);
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);
// 3

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: graphlToken,
    },
  };
});
const apolloClient = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache(),
});
export default apolloClient;
