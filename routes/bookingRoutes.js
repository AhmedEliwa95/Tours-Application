const express = require('express');

const bookingRouter = express.Router();
const { protect, restrictTo } = require('../controller/authController');
const { getCheckoutSession, getAllBookings, createBooking, getBooking, updateBooking, deleteBooking } = require('../controller/bookingController');

bookingRouter.use(protect);

bookingRouter.get('/checkout-session/:tourId'   , getCheckoutSession)
bookingRouter.route('/').get(getAllBookings).post(createBooking);

bookingRouter.use(restrictTo('admin' , 'lead-guide'))
bookingRouter.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking)

module.exports = bookingRouter