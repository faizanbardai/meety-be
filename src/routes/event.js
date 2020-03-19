const express = require("express");
const Event = require("../models/event");
const User = require("../models/user");
const passport = require("passport");
const { getToken } = require("../utils/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const event = await Event.find().populate("host");
    res.status(200).send(event);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.send(event);
  } catch (error) {
    console.log(error);
    res.status(400).send;
  }
});

router.post("/", passport.authenticate("jwt"), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, host: [req.user._id] });
    event.save();
    res.send(event);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const newEvent = await Event.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { ...req.body } },
      { new: true }
    );
    res.send(newEvent);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findOneAndDelete({ _id: req.params.id });
    res.send(deletedEvent);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
