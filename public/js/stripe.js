/* eslint-disable */

import axios from "axios";
import { showAlert } from "./alerts";
// import Stripe from "stripe";

const stripe = Stripe('pk_test_51NEbq9Lsel8zm2dt3CGb8HazUZkIWcd4moNC45G4Crgv0t4totOXaxfeAO9M2fSboeHQy2pKqnoDgjh2JFjFnk0C00EYb77XGl');

export const bookTour = async (tourId) => {
    try{

        // 1) get checkout sesssion from endpoint or api
        const session = await axios({
            method:'GET',
            url:`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        });
        console.log(session)
        // 2) create checkoutform + charge credit API 
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }catch(error){
        console.log(error)
        showAlert('error' , error)
    }

} 