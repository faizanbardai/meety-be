const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hi, I'm event route");
});

router.get("/:id", (req, res) => {
  res.send("Hi, I'm event route");
});

router.post("/", (req, res) => {
  res.send("Hi, I'm event route");
});

router.put("/:id", (req, res) => {
  res.send("Hi, I'm event route");
});

router.delete("/:id", (req, res) => {
  res.send("Hi, I'm event route");
});

module.exports = router;
