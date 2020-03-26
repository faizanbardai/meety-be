const express = require("express");
const router = express.Router();
const passport = require("passport");
const { getToken } = require("../utils/auth");

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: process.env.CLIENT_URL + "/login",
    session: false
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(
      process.env.CLIENT_URL +
        "/auth/facebook/callback/" +
        getToken({ _id: req.user._id })
    );
  }
);
module.exports = router;
