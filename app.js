const express = require("express");
const bodyParser = require("body-parser");
// it exposes a middleware function which will eventually use by express middleware
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

// connection file
const { startServer, app } = require("./connection");
const req = require("express/lib/request");

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
          _id: ID!,
          email: String!
          password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => {
            console.log("events", events);
            return events.map((event) => {
              return { ...event._doc };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: "625829effccc2f85302b93e3",
        });
        let createdEvent;
        return event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc };
            return User.findById("625829effccc2f85302b93e3");
          })
          .then((user) => {
            if (!user) {
              throw new Error("No user exist");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log("err:", err);
            throw err;
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User already exist");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPass) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPass,
            });
            return user
              .save()
              .then((result) => {
                return { ...result._doc, password: null };
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          });
      },
    },
    graphiql: true,
  }),
);

startServer();
