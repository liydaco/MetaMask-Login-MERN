const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
  validateWalletLoginInput,
} = require("../../util/validators");
require("dotenv").config();
const User = require("../../models/User");

const { ethers } = require("ethers");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({
        $or: [{ username: username }, { account: username }],
      });

      if (!user) {
        errors.general = "User not found";

        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    async walletLogin(_, { account }) {
      const { errors, valid } = validateWalletLoginInput(account);
      const user = await User.findOne({
        account: account,
      });

      if (!user) {
        errors.general = "Account not found";

        throw new UserInputError("Account not found", { errors });
      }

      return {
        ...user._doc,
      };
    },

    async walletAuth(_, { account, signature }) {
      const filter = { account: account };
      const update = { nonce: Math.floor(Math.random() * 1000000) };

      const user = await User.findOneAndUpdate(filter, update);
      const token = generateToken(user);
      const msg =
        "Hi " + user.username + "! Your Unique Login Code: " + user.nonce;

      const signingAddress = await ethers.utils.verifyMessage(
        msg.toString(),
        signature
      );

      // The signature verification is successful if the address found with
      // ecrecover matches the initial publicAddress
      if (signingAddress.toLowerCase() === account.toLowerCase()) {
        return {
          ...user._doc,
          id: user._id,
          token,
        };
      } else console.log("signing address is " + signingAddress);
      console.log("account address is " + account);
      console.log("no match");
    },

    async register(
      _,
      { registerInput: { account, username, email, password, confirmPassword } }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        account,
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // Make sure user doesnt already exist
      const user = await User.findOne({ username });

      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }

      const userAccount = await User.findOne({ account });

      if (userAccount) {
        throw new UserInputError("Account is taken", {
          errors: {
            account: "This account is taken",
          },
        });
      }

      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        account,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
