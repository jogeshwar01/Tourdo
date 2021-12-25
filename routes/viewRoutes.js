const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);

//as we want /me to be protected but as isLoggedIn is kinda same so we need to do manually for all the ones which need it to avoid them at the same time
router.get('/', authController.isLoggedIn, viewsController.getOverview);
//no need now of this createBookingCheckout here
//need to add it here for now as we will redirect to this page on booking checkout --will be changed later

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour); //just added protect for testing login
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

router.get(
    '/my-tours',
    authController.protect,
    viewsController.getMyTours
);

router.post('/submit-user-data',
    authController.protect, viewsController.updateUserData);

module.exports = router;