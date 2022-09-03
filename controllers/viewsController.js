const Tour = require("./../models/tourModel");
const Booking = require("./../models/bookingModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getOverview = catchAsync(async function (req, res, next) {
  // 1) get tour data from database
  const tours = await Tour.find();

  // 2) build templates
  // 3) render the template using the tour data from step 1
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    select: "review rating author",
  });

  if (!tour) return next(new AppError("There is no tour with that name", 404));

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = function (req, res, next) {
  res.status(200).render("login", {
    title: "Login into your account",
  });
};

exports.getAccount = function (req, res, next) {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.getMyTours = async function (req, res, next) {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((book) => book.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours,
  });
};
