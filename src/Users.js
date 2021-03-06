import React from 'react';
import {Query, Mutation} from 'react-apollo';
import {gql} from 'apollo-boost';
import {ROOT_QUERY} from './App';


const ADD_FAKE_USERS_MUTATION = gql(`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      name
      githubLogin
      avatar
    }
  }
`);

const Users = () => (
  <Query query={ROOT_QUERY}>
    {
      result =>
        result.loading
        ? <p>Loading Users... </p>
        : <UserList
            count={result.data.totalUsers}
            users={result.data.allUsers}
            refetchUsers={result.refetch} />
    }
  </Query>
);

const UserList = ({count, users, refetchUsers}) =>
  <div>
    <p>{count} Users Loaded</p>
    <button onClick={() => refetchUsers()}>Refetch</button>
    <Mutation
      mutation={ADD_FAKE_USERS_MUTATION}
      variables={{count: 1}}
    >
      {
        addFakeUsers =>
          <button onClick={addFakeUsers}>Add Fake Users</button>
      }
    </Mutation>
    <ul>
    {
      users.map((user) =>
        <UserListItem key={user.githubLogin}
          name={user.name}
          avatar={user.avatar}
        />
      )
    }
    </ul>
  </div>

const UserListItem = ({name, avatar}) =>
  <li>
    <img src={avatar} width={48} height={48} alt='' />
    {name}
  </li>

export default Users;
