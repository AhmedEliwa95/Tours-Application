const express = require('express');

const viewRouter = express.Router();

const {getOverview, getTour, getLoginForm , getAccount , updateUserData , getMyTours} = require('../controller/viewController'); 
const {  isLoggedin, protect } = require('../controller/authController');
const { createBookingCheckout } = require('../controller/bookingController');

// viewRouter.use(isLoggedin);

viewRouter.get('/' ,createBookingCheckout,isLoggedin ,getOverview);
viewRouter.get('/tour/:slug' ,isLoggedin , getTour);
viewRouter.get('/login' ,isLoggedin ,getLoginForm);
viewRouter.get('/me' ,protect  , getAccount);
viewRouter.get('/my-tours' ,protect  ,getMyTours);
viewRouter.post('/submit-user-data' ,protect ,updateUserData);
/// login controller tampelate
module.exports = viewRouter