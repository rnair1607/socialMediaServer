const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const User = require("../../models/User");
const { SECRET } = require("../../config");

module.exports = {
  Mutation: {
    register: async (
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) => {
      // Validate user input
      const { errors, valid } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      // Check for user duplication
      const user = await User.findOne({ username });
      const emailExists = await User.findOne({ email });
      if (user) {
        throw new UserInputError("Username already taken!", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      if (emailExists) {
        throw new UserInputError("A user with this email already exists!", {
          errors: {
            email: "Existing user",
          },
        });
      }

      // Hash the password and return a token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = jwt.sign(
        {
          id: res.id,
          email: res.email,
          username: res.username,
        },
        SECRET
      );

      return {
        email: res.email,
        username: res.username,
        createdAt: res.createdAt,
        id: res._id,
        token,
      };
    },
    login: async (_, { username, password }) => {
      const { errors, valid } = validateLoginInput(username, password);

      const user = await User.findOne({ username });

      // console.log(user);
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      //   const hashedPassword = await bcrypt.hash(password, 12);
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = "Incorrect password";
        throw new UserInputError("Incorrect password", { errors });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        SECRET
      );

      return {
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        id: user._id,
        token,
      };
    },
  },
};
