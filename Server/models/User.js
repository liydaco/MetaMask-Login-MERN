const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  account: String,
  username: String,
  password: String,
  email: String,

  nonce: {
    required: true,
    type: Number,
    default: () => Math.floor(Math.random() * 1000000), // Initialize with a random nonce
  },
});

module.exports = model("User", userSchema);
