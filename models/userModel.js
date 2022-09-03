const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "a user must have a user name"],
    minlength: 4,
  },

  email: {
    type: String,
    required: [true, "a user must have an email address"],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "email address must be valid",
    },
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "a user must have a pasword"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "a user must confirm password"],
    validate: {
      // this only works on CREATE||SAVE!!
      validator: function (currEl) {
        return currEl === this.password;
      },
      message: "passwords are not equal",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordExpirationTime: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  //prettier-ignore
  if (this.passwordChangedAt) {
    const passwordTimeChange = parseInt(this.passwordChangedAt.getTime() / 1000,10);
    return JWTTimestamp < passwordTimeChange;
  }

  // this means password not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordExpirationTime = Date.now() + 5 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
