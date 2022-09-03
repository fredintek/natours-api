const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:resetToken", authController.resetPassword);

// protect all route after this middleware
router.use(authController.protect);

router.get("/me", userController.getMe, userController.getUser);

router.get("/logout", authController.logout);

//prettier-ignore
router.patch("/updatePassword", authController.updatePassword);

router.patch(
  "/updateData",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateData
);

//prettier-ignore
router.delete("/deleteUser",userController.deleteUser);

// allow only admin to handle this routes
router.use(authController.restrictTo("admin"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

// prettier-ignore
router.route("/:id")
  .get(userController.getUser)
  .delete(userController.adminDeleteUser)
  .patch(userController.updateUser);

module.exports = router;
