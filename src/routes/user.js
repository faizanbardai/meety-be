const express = require("express");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
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

// router.get(
//   "/fblogin/callback",
//   passport.authenticate("fb", {
//     successRedirect: "/event",
//     failureRedirect: "/login"
//   })
// );

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

const upload = multer({});
router.post(
  "/:userId/picture",
  upload.single("user-image"),
  async (req, res) => {
    try {
      const imgDest = path.join(
        __dirname,
        "../../img/user" + req.params.userId + req.file.originalname
      );
      const imgDestination =
        req.protocol +
        "://" +
        req.get("host") +
        "/img/user/" +
        req.params.userId +
        req.file.originalname;
      await fs.writeFileSync(imgDest, req.file.buffer);
      console.log(imgDestination);
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { imgHost: imgDestination },
        {
          new: true,
          useFindAndModify: false
        }
      );
      res.send(user);
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
);

module.exports = router;
