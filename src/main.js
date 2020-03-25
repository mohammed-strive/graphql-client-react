import { request } from 'graphql-request';

const query = `
  query listUsers {
    allUsers {
      name
      avatar
    }
  }
`;

const url = 'http://localhost:4000/graphql';
request(url, query).then(console.log).catch(console.error);
