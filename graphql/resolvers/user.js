const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { events, singleEvent, user } = require("../resolvers/utils");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = {
  userList: async () => {
    try {
      const users = await User.find();
      return users.map((user) => {
        return { ...user._doc };
      });
    } catch (error) {
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User already exist");
      }
      const hashesPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashesPassword,
      });
      const userResult = await user.save();
      return { ...userResult._doc, password: null };
    } catch (error) {
      throw error;
    }
  },

  login: async ({ email, password }) => {
    try {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        throw error;
      }
      const isEqual = await bcrypt.compare(password, existingUser.password);
      if (!isEqual) {
        throw new Error("Password is incorrect");
      }
      const payload = {
        userId: existingUser.userId,
        email: existingUser.email,
      };
      const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: "1h",
      });

      return {
        userId: existingUser.id,
        token: token,
        tokenExpiration: 1,
      };
    } catch (error) {
      throw error;
    }
  },
};
