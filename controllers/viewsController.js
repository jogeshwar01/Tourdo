const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//no need to specify .pug here and it will look in the foler specified as the views path at the top
exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template    --in the pug file
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    });
};