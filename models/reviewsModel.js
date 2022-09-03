const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // Using Parent Referencing
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must have an author"],
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      require: [true, "Review must belong to a tour."],
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// preventing duplicate review
reviewSchema.index({ author: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "name photo",
  });
  next();

  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "author",
  //   select: "name photo",
  // });
});

// the (.statics) method gives access to the collection/model/document constructor

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//post middleware does not need the next function
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewDoc = await this.findOne(); // return query as document
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.reviewDoc.constructor.calcAverageRatings(this.reviewDoc.tour);
});
const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
