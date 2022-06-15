const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    account: String
    id: ID!
    email: String!
    username: String!
    nonce: String
    token: String
  }
  input RegisterInput {
    account: String
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type Query {
    root: String
  }

  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    walletLogin(account: String!): User!
    walletAuth(account: String!, signature: String!): User!
  }
`;
