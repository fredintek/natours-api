const Reviews = require("./../models/reviewsModel");
const factory = require("./../controllers/handlerFactory");
// const launchDB = require("./../dev-data/data/launchDB");
// const catchAsync = require("./../utils/catchAsync");

// launchDB.populateDbReview();

exports.getAllReviews = factory.getAll(Reviews);

exports.setTourUserIds = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.author) req.body.author = req.user.id;

  next();
};

exports.getReview = factory.getOne(Reviews);

exports.createReview = factory.createOne(Reviews);

// this action is just for admin alone
exports.updateReview = factory.updateOne(Reviews);
exports.deleteReview = factory.deleteOne(Reviews);
