const express = require("express");
const userRouter = express.Router();

userRouter.get("/:id", (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

userRouter.post("/login", (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.send.status(500);
  }
});

userRouter.post("/createAccount", (req, res) => {
  res.send("Hi, I'm user route");
});

userRouter.put("/", (req, res) => {
  res.send("Hi, I'm user route");
});

userRouter.delete("/", (req, res) => {
  res.send("Hi, I'm user route");
});

module.exports = userRouter;
