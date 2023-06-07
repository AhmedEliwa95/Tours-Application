const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/toursModel')
// const AppError = require('../utils/appError')
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync')

const getCheckoutSession =catchAsync(async (req,res,next) => {
    /// 1) get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)

    /// 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email , 
        client_reference_id : req.params.tourId,
        line_items:[
            {
                // name:`${tour.name} Tour` , 
                // description:tour.summary,
                // images:[`http://127.0.0.1:3000/img/tours/${tour.imageCover}`] , 
                
                price_data:{
                    currency : 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                    unit_amount:tour.price * 100 , 
                },
                quantity:1
            }
        ],
       
          mode: 'payment'
    });
    /// 3) create session as response
    res.status(200).json({
        status:'success',
        session
    })
});

const createBookingCheckout =catchAsync( async(req,res,next) =>{
    ///this is only temporary because it's unsecure, every one can make bookings without paying
    const {tour , user , price} = req.query;

    if(!tour && !user && !price) return next();

    await Booking.create({tour , price , user})

    res.redirect(req.originalUrl.split('?')[0]);
});

const createBooking = factory.createOne(Booking)
const getBooking = factory.getOne(Booking)
const getAllBookings = factory.getAll(Booking)
const updateBooking = factory.updateOne(Booking)
const deleteBooking = factory.deleteOne(Booking)

module.exports = {
    getCheckoutSession,
    createBookingCheckout,
    createBooking,
    getAllBookings,
    getBooking,
    updateBooking,
    deleteBooking
}