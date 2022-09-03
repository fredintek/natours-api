import axios from "axios";
import { showAlert } from "./alert";
const stripe = Stripe(
  "pk_test_51LeJKIKDMxf33gLq8XYiLzEOthBPDnBaDwI7sb2sC7fKWhKlf2ZBaJyjR6WaEJVwIopnCBEmnq0ZuQ3RE4Lck3HV008TWQla7K"
);

export const bookTour = async function (tourId) {
  try {
    // 1) get the session from the server
    const session = await axios({
      method: "GET",
      url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    });

    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};
