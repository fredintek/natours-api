const AppError = require("./../utils/appError");

const handleCastErrorDb = function (err) {
  const msg = `you have an invalid ${err.path} with a value of ${err.value}`;
  return new AppError(msg, 400);
};

const handleDuplicateFieldsDb = function (err) {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const msg = `Duplicate field value ${value}; please use another value`;

  return new AppError(msg, 400);
};

const handleValidationErrorDb = function () {
  const msg = `Invalid input data`;
  return new AppError(msg, 400);
};

const handleJWTError = function () {
  return new AppError("invalid token please log in again", 401);
};

const handleJWTExpireError = function () {
  return new AppError("token session has expired", 401);
};

const sendErrorDev = function (err, res, req) {
  // API
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      err,
      message: err.message,
      stackTrace: err.stack,
    });

    // RENDERED WEBSITE
  }
  res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: err.message,
  });
};

const sendErrorProd = function (err, res, req) {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational === true) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error("ERROR", err);
    return res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }

  if (err.isOperational === true) {
    // console.error("ERROR", err);
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  console.error("ERROR", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res, req);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);
    if (error.name === "ValidationError") error = handleValidationErrorDb();
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpireError();
    sendErrorProd(error, res, req);
  }
  next();
};
