import React from 'react';
import Users from './Users';
import {gql} from 'apollo-boost';
import {BrowserRouter} from 'react-router-dom';
import AuthorizedUser from './AuthorizedUser';
import {withApollo} from 'react-apollo';

export const ROOT_QUERY = gql(`
  query allUsers {
    totalUsers
    allUsers {
      ...userInfo
    }
    me {
      ...userInfo
    }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`);

export const LISTEN_FOR_USERS = gql(`
  subscription {
    newUser {
      name
      avatar
    }
  }
`);

class App extends React.Component {

  componentDidMount() {
    let {client} = this.props;
    this.listenForUsers = client.subscribe({query: LISTEN_FOR_USERS}).subscribe(
      ({data:{newUser}}) => {
        const data = client.readQuery({query: ROOT_QUERY});
        data.totalUsers += 1;
        data.allUsers = [
          ...data.allUsers,
          newUser
        ];
        client.writeQuery({query: ROOT_QUERY, data});
      });
  }

  componentWillUnmount() {
    this.listenForUsers.unsubscribe();
  }

  render() {
    return (
      <BrowserRouter>
        <AuthorizedUser />
        <Users />
      </BrowserRouter>
    );
  }

}

export default withApollo(App);
