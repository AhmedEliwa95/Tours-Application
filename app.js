const path = require('path');
// const pug = require('pug');
const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError');
const errorController = require('./controller/errorController');
// const globalErrorHandler = require('./controller/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
 
/// Declare express to be your app
const app = express();

/// Views setup 
app.set('view engine' , 'pug');
app.set('views' , path.join(__dirname,'views'))

//////////// Global Middlewares \\\\\\\\\\\\
// Security HTTP Headers
app.use(helmet());

/// Serving Static files
app.use(express.static(path.join(__dirname,'public')))

// Development Loging
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
};

/// Limit request from same API
const limiter = rateLimit({
	windowMs:  60* 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:`Too many request from this IP please try again in one hour`,
	// standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	// legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginLimiter = rateLimit({
	windowMs:  60* 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:`Too many request from this IP please try again in one hour`,
	// standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	// legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use('/api/v1/users/login',loginLimiter)
app.use('/api',limiter)

////// Body Parser\\\\\
app.use(express.json({limit:'10kb'})); /// barsing data from req.body
app.use(express.urlencoded({extended:true , limit:'10kb'}))/// to barse the data returned from html form
app.use(cookieParser()); // reading data from cookies

// Data Sanitization against Nosql Query Injection
app.use(mongoSanitize())
// Data Sanitization against XSS: Cross site scripting attacks
app.use(xss())
// Prevent paramater Polution
app.use(hpp({
    whitelist:['duration' , 'ratingsAverage' , 'ratingsQuantity' , 'maxGroupSize' , 'difficulty' , 'price']
}));


// Test Middle ware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies)
    next();
})


// app.get('/',async(req,res)=>{
//     res.status(200).send('Natrous App');
// })

//// Miidleware Routes \\\\\
app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

/// not found route and it must be at the end of the code 
app.all('*' , (req,res,next)=>{

    // const err = new Error(`can't find ${req.originalUrl} on this server!!`);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`can't find ${req.originalUrl} on this server!` , 404))
});

/// Error Middleware
app.use(errorController)

module.exports = app;