const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userRoles = require("../utils/enum");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: [true, "Please add a username"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "Please add a password"],
  },
  role: {
    type: String,
    enum: {
      values: Object.values(userRoles),
      message: "{VALUE} is not supported",
    },
    default: userRoles.USER,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre("save", async function (_next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user's entered password to a hashed password in a database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
