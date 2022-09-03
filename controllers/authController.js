const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const Email = require("./../utils/email");
const crypto = require("crypto");

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (user, res, statusCode) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 3600000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.security = true;
  // create cookie
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async function (req, res, next) {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, res, 201);
});

exports.login = catchAsync(async function (req, res, next) {
  const { email: userEmail, password: userPassword } = req.body;

  // 1) Check if email and password exits
  if (!userEmail || !userPassword) {
    return next(new AppError("Please provide an email or password", 400));
  }
  // 2) Check if user && password is correct
  const user = await User.findOne({ email: userEmail }).select("+password");
  // console.log(user);

  // 3) if everything is okay send token
  //prettier-ignore
  if (!user || !await bcrypt.compare(userPassword, user.password)){
    return next(new AppError(`incorrect email or password`, 401));
  }

  createSendToken(user, res, 200);
});

exports.logout = function (req, res, next) {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

exports.protect = catchAsync(async function (req, res, next) {
  // 1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    //prettier-ignore
    return next(new AppError("you are not logged in!\nplease login to access the page",400));
  }

  // 2) verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError("user does not exists", 401));

  // 4) check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed password! please log in again", 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//only for rendered pages, no errors
exports.isAuthenticated = async function (req, res, next) {
  // check for jwt in cookies
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // decode jwt and get current user
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // send current user to the template
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array = ["admin", "lead-guide"]
    // const currentUser = req.user;
    // const currentUserRole = currentUser.role;
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you are not authorized to perform this action", 400)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  // 1) get user based on posted email address
  const { email: userEmail } = req.body;
  const user = await User.findOne({ email: userEmail }).select("+password");
  if (!user) {
    return next(new AppError("user not found", 404));
  }

  // 2) generate the random token
  const passwordToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) now send it back as an email

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token (valid for 5 min)",
    //   message,
    // });
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${passwordToken}`;

    await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordExpirationTime = undefined;
    await user.save({ validateBeforeSave: false });

    // return next(err);
    return next(new AppError("there was an error sending this email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
  });
});

exports.resetPassword = async function (req, res, next) {
  // 1) get user based on the token
  const tokenResetEncrypt = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  // prettier-ignore
  const user = await User.findOne({passwordResetToken: tokenResetEncrypt, passwordExpirationTime: {$gt: Date.now()}}).select("+password");

  if (!user) {
    return next(new AppError("token is invalid or expired", 400));
  }

  // 2) set the new password only if token has not expired and user exists
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordExpirationTime = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  // 3) update changedPasswordAt property for the user
  // 4) log the user in
  createSendToken(user, res, 200);
};

exports.updatePassword = catchAsync(async function (req, res, next) {
  // 1) get user from the collection
  const user = await User.findById(req.user._id).select("+password");

  // 2) check if the posted password is correct with the one in the db
  if (!(await bcrypt.compare(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError("Current password is not correct! try again", 401)
    );
  }

  // 3) if posted password is correct update user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  // 4) log user in, send JWT
  createSendToken(user, res, 200);
});
