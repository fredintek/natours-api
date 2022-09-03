const path = require("path");
const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewsRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();

// setting up pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

// -------------MIDDLEWARES...----------------
app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", "data:", "blob:"],

//       fontSrc: ["'self'", "https:", "data:"],

//       scriptSrc: ["'self'", "unsafe-inline"],

//       scriptSrc: ["'self'", "https://*.cloudflare.com"],

//       scriptSrcElem: ["'self'", "https:", "https://*.cloudflare.com"],

//       connectSrc: ["'self'", "data", "https://*.cloudflare.com"],
//     },
//   })
// );

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// parses data from the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// parses data from cookies
app.use(cookieParser());

// data sanitization against nosql query injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ---------------EXPRESS ROUTERS----------------
// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTour);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

app.use(viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
