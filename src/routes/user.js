const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");

userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user ? res.send(user) : res.send("No user found!");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

userRouter.post("/login", (req, res) => {
  try {
    res.send("Hi, I'm user route");
  } catch (error) {
    console.log(error);
    res.send.status(500);
  }
});

userRouter.post("/createAccount", async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send;
  }
});

userRouter.put("/", (req, res) => {
  res.send("Hi, I'm user route");
});

userRouter.delete("/", (req, res) => {
  res.send("Hi, I'm user route");
});

module.exports = userRouter;
