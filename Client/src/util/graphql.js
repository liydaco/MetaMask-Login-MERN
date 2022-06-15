import gql from "graphql-tag";

export const REGISTER_USER = gql`
  mutation register(
    $account: String!
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        account: $account
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      email
      account
      username
      token
      profileImageUrl
    }
  }
`;

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      id
      account
      email
      username
    }
  }
`;

export const WALLET_LOGIN = gql`
  mutation walletLogin($account: String!) {
    walletLogin(account: $account) {
      nonce
      account
      username
    }
  }
`;

export const WALLET_AUTH = gql`
  mutation walletAuth($account: String!, $signature: String!) {
    walletAuth(account: $account, signature: $signature) {
      id
      account
      email
      username
      token
    }
  }
`;
