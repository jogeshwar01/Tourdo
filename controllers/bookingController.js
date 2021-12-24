const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
//installed version 7 of stripe so that code wont break --else we would need to do for latest version 8
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    console.log(tour);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,   //url to go for successful payment
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,    //url where user goes if they cancel the payment
        customer_email: req.user.email, //as protect called before,so we have user on req.user
        client_reference_id: req.params.tourId, //allows us to pass data about the session we are creating--helpful later 
        //line_items -info about product to be purchased
        line_items: [
            //these field names comes from stripe like currency,amount etc and cannot be changed
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                //need real images on server --as stripe will upload them then so we need a deployed website so we choose these from the actual deployed web
                amount: tour.price * 100,   //in cents
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});