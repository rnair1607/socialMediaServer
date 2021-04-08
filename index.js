const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");

const { MONGODB } = require("./config");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const pubsub = new PubSub();
const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});
// server.applyMiddleware({ cors: false });

// app.use(cors(corsOptions));

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("DB connected");
    return server.listen({ port: 8000 });
  })
  .then((res) => {
    return console.log(`Server running at ${res.url}`);
  });
