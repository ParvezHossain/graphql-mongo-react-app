const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const events = (eventIds) => {
  return Event.find({
    _id: { $in: eventIds },
  })
    .then((events) => {
      return events.map((event) => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event.creator),
        };
      });
    })
    .catch((err) => {
      throw err;
    });
};

const user = (userId) => {
  return User.findById(userId)
    .then((user) => {
      return {
        ...user._doc,
        password: null,
        createdEvents: events.bind(this, user._doc.createdEvents),
      };
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  events: () => {
    return (
      Event.find()
        // .populate("createdEvents")
        .then((events) => {
          return events.map((event) => {
            return {
              ...event._doc,
              date: new Date(event._doc.date).toISOString(),
              creator: user.bind(this, event._doc.creator),
              createdEvents: null,
            };
          });
          /* return {
                ...event._doc,
                creator: {
                  ...event._doc.creator._doc,
                  password: null,
                },
              };
            }); */
        })
        .catch((err) => {
          throw err;
        })
    );
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
        createdEvent = {
          ...result._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, result._doc.creator),
        };
        return User.findById("6258475e32ad9a435c26ed37");
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
};
