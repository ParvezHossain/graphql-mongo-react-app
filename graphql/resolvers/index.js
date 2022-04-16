const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const { dateToISOString } = require("../../helpers/date");

const transformEvent = (event) => {
  return {
    ...event._doc,
    date: dateToISOString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToISOString(booking._doc.createdAt),
    updatedAt: dateToISOString(booking._doc.updatedAt),
  };
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (error) {
    throw error;
  }
};

const events = async (eventIds) => {
  try {
    const events = await Event.find({
      _id: { $in: eventIds },
    });
    events.map((event) => {
      return transformEvent(event);
    });
    return events;
  } catch (error) {
    throw error;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      password: null,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (error) {
      throw error;
    }
  },
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

  bookings: async () => {
    try {
      const eventList = await Booking.find();
      return eventList.map((booking) => {
        return transformBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },

  createEvent: async (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "6259b55a5273cbcd3113dfd3",
    });
    let createdEvent;

    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById("6259b55a5273cbcd3113dfd3");

      if (!creator) {
        throw new Error("No user exist");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
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
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findById({ _id: args.eventId });
    const booking = new Booking({
      user: "6259b55a5273cbcd3113dfd3",
      event: fetchedEvent,
    });
    const result = await booking.save();
    return transformBooking(result);
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw error;
    }
  },
};
