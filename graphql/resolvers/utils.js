const User = require("../../models/user");
const Event = require("../../models/event");
const { dateToISOString } = require("../../helpers/date");

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
    return events.map((event) => {
      return transformEvent(event);
    });
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

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToISOString(booking._doc.createdAt),
    updatedAt: dateToISOString(booking._doc.updatedAt),
  };
};
const transformEvent = (event) => {
  return {
    ...event._doc,
    date: dateToISOString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
