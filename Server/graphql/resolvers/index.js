const usersResolvers = require("./users");

module.exports = {
  Query: {},
  Mutation: {
    ...usersResolvers.Mutation,
  },
};
