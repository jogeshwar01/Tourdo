const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
//const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};//set the body as it was in our old function

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {

//     // to make this workGET /tour/234fad4/reviews
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);

//     // SEND RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//     //if manually we dont specify the tour & user ids in the url
//     if (!req.body.tour) req.body.tour = req.params.tourId;  //from the parameter in url
//     if (!req.body.user) req.body.user = req.user.id;   //from protect middleware

//     const newReview = await Review.create(req.body);

//     // SEND RESPONSE
//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview
//         }
//     });
// });