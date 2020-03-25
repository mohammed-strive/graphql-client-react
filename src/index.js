import React from 'react';
import {render} from 'react-dom';
import App from './App';
import {ApolloProvider} from 'react-apollo';
import {
  InMemoryCache,
  HttpLink,
  ApolloLink,
  ApolloClient,
  split
} from 'apollo-boost';
import {persistCache} from 'apollo-cache-persist';
import {WebSocketLink} from 'apollo-link-ws';
import {getMainDefinition} from 'apollo-utilities';

const cache = new InMemoryCache();
persistCache({
  cache,
  storage: localStorage,
});

const httpLink = new HttpLink({uri: `http://localhost:4000/graphql`});
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  reconnect: true,
});

const authLink  = new ApolloLink((operation, forward) => {
  operation.setContext((context) => ({
    headers: {
      ...context.headers,
      authorization: localStorage.getItem('token'),
    },
  }));
  return forward(operation);
});
const httpAuthLink = authLink.concat(httpLink);

const link = split(
  ({query}) => {
    const {kind, operation} = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'Subscription';
  },
  wsLink,
  httpAuthLink,
);

if (localStorage['apollo-cache-persist']) {
  let cacheData = JSON.parse(localStorage['apollo-cache-persist']);
  cache.restore(cacheData);
}

const client = new ApolloClient({
  link,
  cache,
  uri: `http://localhost:4000/graphql`,
  request: operation => {
    operation.setContext(context => ({
      headers: {
        ...context.headers,
        authorization: localStorage.getItem('token'),
      },
    }));
  },
});

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>, 
  document.getElementById('root')
);
