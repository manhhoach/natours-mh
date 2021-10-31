const Booking= require('./../models/bookingModel')
const factory = require('./handlerFactory');


module.exports.createBooking=factory.createOne(Booking);
module.exports.getAllBooking=factory.getAll(Booking);
module.exports.getBooking=factory.getOne(Booking);
module.exports.updateBooking=factory.updateOne(Booking);
module.exports.deleteBooking=factory.deleteOne(Booking);