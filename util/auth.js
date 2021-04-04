const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const { SECRET } = require("../config");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  //   console.log(authHeader);
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/expired token");
      }
    }
    throw new Error("Auth token must be 'Bearer [token]'");
  }
  throw new Error("Auth header is required");
};
