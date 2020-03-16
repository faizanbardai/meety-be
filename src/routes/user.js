const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hi, I'm user route");
});

router.get("/id", (req, res) => {
  res.send("Hi, I'm user route");
});

router.post("/", (req, res) => {
  res.send("Hi, I'm user route");
});

router.put("/:id", (req, res) => {
  res.send("Hi, I'm user route");
});

router.delete("/:id", (req, res) => {
  res.send("Hi, I'm user route");
});

module.exports = router;
