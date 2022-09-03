const fs = require("fs");
const Tour = require("./../../models/tourModel");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewsModel");

//prettier-ignore
const tourData = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,{encoding:"utf-8"}));
//prettier-ignore
const userData = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, {encoding: "utf-8"}));
//prettier-ignore
const reviewsData = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, {encoding: "utf-8"}))

module.exports.populateDbTourData = async function () {
  try {
    await Tour.create(tourData);
    console.log("Data successfully created");
  } catch (err) {
    console.log(err);
  }
};

module.exports.populateDbUsers = async function () {
  try {
    await User.create(userData, { validateBeforeSave: false });
    console.log("all user successfuly created..");
  } catch (err) {
    console.log(err);
  }
};

module.exports.populateDbReview = async function () {
  try {
    await Review.create(reviewsData);
    console.log("all reviews successfuly created..");
  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteDbAny = async function (model) {
  try {
    await model.deleteMany();
    console.log("All data successfully deleted");
  } catch (err) {
    console.log(err);
  }
};
