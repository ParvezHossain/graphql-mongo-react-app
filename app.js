const bodyParser = require("body-parser");
// it exposes a middleware function which will eventually use by express middleware
const { graphqlHTTP } = require("express-graphql");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolver = require("./graphql/resolvers/index");

// connection file
const { startServer, app } = require("./connection");

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolver,
    graphiql: true,
  }),
);

startServer();
