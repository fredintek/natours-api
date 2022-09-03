const express = require("express");
const viewController = require("./../controllers/viewsController");
const authController = require("./../controllers/authController");
const bookingController = require("./../controllers/bookingController");

const router = express.Router();

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isAuthenticated,
  viewController.getOverview
);

router.get(
  "/tour/:slug",
  authController.isAuthenticated,
  viewController.getTour
);

router.get(
  "/login",
  authController.isAuthenticated,
  viewController.getLoginForm
);

router.get("/me", authController.protect, viewController.getAccount);

router.get("/my-tours", authController.protect, viewController.getMyTours);

module.exports = router;
