import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {gql} from 'apollo-boost';
import {Query, Mutation, withApollo, compose} from 'react-apollo';
import {ROOT_QUERY} from './App';

const GITHUB_AUTH_MUTATION = gql(`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`);

class AuthorizedUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signingIn: false,
    };
    this.requestCode = this.requestCode.bind(this);
    this.authorizationComplete = this.authorizationComplete.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    if (window.location.search.match(/code=/)) {
      this.setState({signingIn: true});
      const code = window.location.search.replace("?code=", "");
      alert(code);
      this.githubAuthMutation({variables: {code}});
    }
  }

  requestCode() {
    const clientID = 'df8c50a226fe5b96064e';
    window.location=`https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user&redirect_uri=http://localhost:3000`;
  }

  authorizationComplete(cache, {data}) {
    localStorage.setItem('token', data.githubAuth.token);
    this.props.history.replace('/');
    this.setState({signingIn: false});
  }

  logout() {
    localStorage.removeItem('token');
    let data = this.props.client.readQuery({query: ROOT_QUERY});
    data.me = null;
    this.props.client.writeQuery({query:ROOT_QUERY, data});
  }

  render() {
    return (
      <Mutation mutation={GITHUB_AUTH_MUTATION}
        update={this.authorizationComplete}
        refetchQueries={[{query: ROOT_QUERY}]}
      >
        {
          mutation => {
            this.githubAuthMutation = mutation;
            return (
              <Me
                logout={this.logout}
                signingIn={this.state.signingIn}
                requestCode={this.requestCode}
              />
            );
          }
        }
      </Mutation>
    );
  }
}

const Me = ({logout, signingIn, requestCode}) => {
  return (
    <Query query={ROOT_QUERY}>
      {
        ({data, loading}) =>
          data && data.me
          ? <CurrentUser {...data.me} logout={logout} />
          : loading
            ? <p>Loading....</p>
            : <button onClick={requestCode} disabled={signingIn}>
                Sign In with Github
              </button>
      }
    </Query>
  );
};

const CurrentUser = ({name, avatar, logout}) =>
  <div>
    <img src={avatar} height={48} width={48} alt='' />
    <h1>{name}</h1>
    <button onClick={() => logout()}>Logout</button>
  </div>

export default compose(withApollo, withRouter)(AuthorizedUser);

