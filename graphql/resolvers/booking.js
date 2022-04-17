const Booking = require("../../models/booking");
const Event = require("..//..//models/event");
const { transformBooking, transformEvent } = require("../resolvers/utils");
const { dateToISOString } = require("../../helpers/date");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated user!");
    }
    try {
      const eventList = await Booking.find();

      return eventList.map((booking) => {
        return transformBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated user!");
    }
    const fetchedEvent = await Event.findById({ _id: args.eventId });
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent,
    });
    const result = await booking.save();
    return transformBooking(result);
  },

  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated user!");
    }
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
