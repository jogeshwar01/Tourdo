/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51JzfKQSAJ3mr6KzPp0ThmkfhgCtYBhJYZfyOHW49xhHEy9QRF2GxaEETpkCKx6YWTpqZZDTPKMOFMBm36FXCVyxF00H5GwRxdp');

//turn on Successful payments in email in settings to get users notified on their email about the payment
export const bookTour = async tourId => {
    try {
        // 1) Get checkout session from API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`
        );
        //console.log(session);

        // 2) Create checkout form + charge money from credit card
        // inbuilt in stripe
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id  //console.log to check how session looks
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};