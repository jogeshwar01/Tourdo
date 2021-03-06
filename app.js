const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

//also changed json "engines": {"node": "^14"} as other one was giving problems

app.enable('trust proxy');  //as heroku is also a proxy --this is built into express for these situations

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));    //to tell where our views are located
// path.join will take care if our path has / or not --very useful

// GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());    //will only work for simple requests --get/post
// sets 'Access-Control-Allow-Origin' header to *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

//to make it work for non simple requests --put/patch/delete/send cookies/using non standard headers
app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());    //to allow non simple request for a specific url

// Serving static files
// responsiible for looking of static assets in public
app.use(express.static(path.join(__dirname, 'public')));    //public is default folder--to serve static files like any html or images

// Set security HTTP headers -put in beginning
app.use(helmet({
    contentSecurityPolicy: false,   //need to do this as otherwise this wont allow mapbox to be loaded
}));  // helemt() will return the desired middleware function

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API --the number is reset on restarting the app
// Rate Limiting -to prevent same IP to make too many requests to our API
const limiter = rateLimit({
    max: 100,       // Max 100 requests in an hour -adapt to your app
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
// to see how many requests pending in postman check headers in output
app.use('/api', limiter);   // limit our api routes

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// need body coming in request not in JSON but in raw format and hence put it before the body parser which is the next line
app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),  //can use npm package body-parser but no need as now express has it built in
    bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));   //max amount of data that can come into body set to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //to parse form data into req.body
app.use(cookieParser());    //parses data from cookie

// Data sanitization against NoSQL query injection 
//--> "email":{"$gt":""}    //insert in login and with a password it would work if we dont use this middlewware
// needs to be after body parser as the previous middleware reads data into req.body
app.use(mongoSanitize());       //looks at req.body,req,query,req,params & filters out $ and .

// Data sanitization against XSS    ->prevent malicious html code with js
app.use(xss());

// Prevent parameter pollution --clear up the query string and uses the last specified one instead of creating an array hence no error
// -> ?sort=difficult&sort=price --express will create an array of sort=['duration','price'] which we cannot split as in apiFeatures and this will give an error
app.use(
    hpp({
        // properties where duplicate values should be allowed are in whitelist
        // as ?duration=5&duration=9 should work
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

app.use(compression()); //to compress responses 

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
})

//ROUTES
//mounting routers  

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);   //tourRouter is middleware to be applied for specific url
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//to handle for all the requests/http methods.  -order matters hence this has to be at the last else all requests will go into this
app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    //next function with an argument is always taken as an error by express 
    //and all other normal middlewares are skipped and we go to global error handling middleware
});

app.use(globalErrorHandler);

module.exports = app;

