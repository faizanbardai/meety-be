const express = require("express");
const router = express.Router();

router.get("/:id", (req, res) => {
  res.send("Hi, I'm user route");
});

router.post("/login", (req, res) => {
  res.send("Hi, I'm user route");
});

router.post("/createAccount", (req, res) => {
  res.send("Hi, I'm user route");
});

router.put("/", (req, res) => {
  res.send("Hi, I'm user route");
});

router.delete("/", (req, res) => {
  res.send("Hi, I'm user route");
});

module.exports = router;
