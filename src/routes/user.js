const express = require("express");
const passport = require("passport");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/user");

const { check, validationResult, body } = require("express-validator");
const { getToken } = require("../utils/auth");
const multer = require("multer");
const MulterAzureStorage = require("multer-azure-storage");

const router = express.Router();

router.post(
  "/createAccount",
  [
    check("username", "Email is required")
      .exists()
      .isEmail()
      .withMessage("Email is not valid"),
    check("name", "User name is required")
      .exists()
      .isLength({ min: 3, max: 25 })
      .withMessage("Name should be min3 to max25 char length"),
    check("password", "Password is required")
      .exists()
      .isLength({ min: 8 })
      .withMessage("Password must contain at least 8 char")
      .matches(/\d/)
      .withMessage("Password must contain a number")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const user = await User.register(req.body, req.body.password);
      const token = getToken({ _id: user._id });
      //To avoid sending Salt and Hash
      const userToSend = await User.findById(user._id);
      res.send({ access_token: token, user: userToSend });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.post("/login", passport.authenticate("local"), async (req, res) => {
  const token = getToken({ _id: req.user._id });
  res.send({
    access_token: token,
    user: req.user
  });
});

// To be added
// router.post("/fblogin", passport.authenticate("fb"), async (req, res) => {
//   const token = getToken({ _id: req.user._id });
//   res.send({
//     acess_token: token,
//     user: req.user
//   });
// });

// router.get(
//   "/fblogin/callback",
//   passport.authenticate("fb", {
//     successRedirect: "/event",
//     failureRedirect: "/login"
//   })
// );

router.get("/refresh", passport.authenticate("jwt"), async (req, res) => {
  const token = getToken({ _id: req.user._id });
  res.send({
    access_token: token,
    user: req.user
  });
});

router.get("/id/:_id", passport.authenticate("jwt"), async (req, res) => {
  const isIDValid = mongoose.Types.ObjectId.isValid(req.params._id);
  if (isIDValid) {
    try {
      const user = await User.findById(req.params._id).populate("events");
      user ? res.send(user) : res.status(404).send("No user found!");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  } else res.status(400).send("User ID is not valid");
});

router.put(
  "/changepassword",
  [
    check("password", "Password is required")
      .exists()
      .isLength({ min: 8 })
      .withMessage("Password must contain at least 8 char")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must contain at least 8 char")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .custom((value, { req }) => {
        if (value === req.body.password) {
          throw new Error("New password should not same to old password");
        }
        return true;
      })
  ],
  passport.authenticate("local"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const user = await User.findById(req.user._id);
    const result = await user.setPassword(req.body.newPassword);
    user.save();
    res.send(result);
  }
);

router.put(
  "/",
  [
    check("aboutMe", "profile is required")
      .exists()
      .isLength({ min: 10, max: 150 })
      .withMessage("about me should be min 10 to max 150 char length")
  ],
  passport.authenticate("jwt"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { ...req.body } },
        { new: true }
      );
      res.send(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

var upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: "meety-user",
    containerSecurity: "blob"
  }),
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  }
});
router.put(
  "/picture",
  passport.authenticate("jwt"),
  upload.single("picture"),
  async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { picture: req.file.url },
        { new: true }
      );
      res.send(updatedUser);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.delete("/", passport.authenticate("local"), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    res.send({ message: "User deleted", deletedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send;
  }
});

router.get(
  "/search/:search",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      const user = await User.find({
        name: { $regex: ".*" + req.params.search + ".*", $options: "i" }
      }).populate("events"); //any user that contains the search string(i = both lowercase and uppercase)
      user ? res.send(user) : res.status(404).send("No user found!");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

module.exports = router;
