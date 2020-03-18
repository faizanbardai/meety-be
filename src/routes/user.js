const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { getToken } = require("../utils/auth");

const router = express.Router();

router.post("/createAccount", async (req, res) => {
  try {
    const user = await User.register(req.body, req.body.password);
    const token = getToken({ _id: user._id });
    res.send({ access_token: token, user });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/login", passport.authenticate("local"), async (req, res) => {
  const token = getToken({ _id: req.user._id });
  res.send({
    acess_token: token,
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

router.post("/refresh", passport.authenticate("jwt"), async (req, res) => {
  const token = getToken({ _id: req.user._id });
  res.send({
    access_token: token,
    user: req.user
  });
});

router.post("/id/:_id", passport.authenticate("jwt"), async (req, res) => {
  res.send(await User.findById(req.params._id));
});

router.post(
  "/changepassword",
  passport.authenticate("local"),
  async (req, res) => {
    const user = await User.findById(req.user._id);
    const result = await user.setPassword(req.body.newPassword);
    user.save();
    res.send(result);
  }
);

router.put("/", passport.authenticate("jwt"), async (req, res) => {
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
});

router.delete("/", passport.authenticate("local"), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    res.send({ message: "User deleted", deletedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send;
  }
});

module.exports = router;
