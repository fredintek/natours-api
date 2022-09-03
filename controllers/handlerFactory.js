const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.deleteOne = function (model) {
  return catchAsync(async function (req, res, next) {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("document not found", 404));
    }

    res.status(204).json({
      status: "success",
      message: "deleted",
      data: null,
    });
  });
};

exports.updateOne = function (model) {
  return catchAsync(async function (req, res, next) {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`No tour with that ID ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.createOne = function (model) {
  return catchAsync(async function (req, res, next) {
    const doc = await model.create(req.body);

    res.status(201).json({
      message: "success",
      data: {
        doc,
      },
    });
  });
};

exports.getOne = function (model, popOptions) {
  return catchAsync(async function (req, res, next) {
    //prettier-ignore
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError("document not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "ok",
      data: {
        doc,
      },
    });
  });
};

exports.getAll = function (model) {
  return catchAsync(async function (req, res, next) {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();

    res.status(200).json({
      status: "success",
      page: features.pageValue,
      resultsPerPage: doc.length,
      data: {
        doc,
      },
    });
  });
};
