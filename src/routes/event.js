const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/event");
const User = require("../models/user");
const passport = require("passport");
const multer = require("multer");
const MulterAzureStorage = require("multer-azure-storage");
const { check, validationResult } = require("express-validator");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("host");
    res.status(200).send(events);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/id/:id", async (req, res) => {
  const isIDValid = mongoose.Types.ObjectId.isValid(req.params.id);
  if (isIDValid) {
    try {
      const event = await Event.findById(req.params.id).populate(
        "participants host"
      );
      event ? res.send(event) : res.status(404).send("No event found!");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  } else res.status(400).send("Event ID is not valid");
});

router.get("/hottest-of-the-week", async (req, res) => {
  const date = new Date();
  const dateAfter1Week = date.setDate(date.getDate() + 7);
  try {
    const events = await Event.find({
      schedule: { $gte: new Date(), $lte: new Date(dateAfter1Week) }
    })
      .sort({ participantsLength: -1 })
      .limit(3)
      .populate("host").populate("participants");
    res.send(events);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/hottest-of-next-week", async (req, res) => {
  const date = new Date();
  const dateAfter1Week = date.setDate(date.getDate() + 7);
  const dateAfter2Weeks = date.setDate(date.getDate() + 14);
  try {
    const events = await Event.find({
      schedule: {
        $gte: new Date(dateAfter1Week),
        $lte: new Date(dateAfter2Weeks)
      }
    })
      .sort({ participantsLength: -1 })
      .limit(3)
      .populate("host").populate("participants");
    res.send(events);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/hottest-of-the-month", async (req, res) => {
  const date = new Date();
  const dateAfter1Month = date.setDate(date.getDate() + 30);
  try {
    const events = await Event.find({
      schedule: {
        $gte: new Date(),
        $lte: new Date(dateAfter1Month)
      }
    })
      .sort({ participantsLength: -1 })
      .limit(3)
      .populate("host").populate("participants");
    res.send(events);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.get("/all-upcoming", async (req, res) => {
  try {
    const events = await Event.find({
      schedule: {
        $gte: new Date()
      }
    })
      .sort({ participantsLength: -1 })
      .limit(3)
      .populate("host").populate("participants");
    res.send(events);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post(
  "/",
  [
    check("name")
      .isLength({ min: 3, max: 100 })
      .withMessage("Name should be minimum of 3 charecters"),
    check("schedule")
      .exists()
      .isISO8601("yyyy-mm-dd")
      .isAfter()
      .toDate()
      .withMessage("Create schedule for Today and ahead"),
    check("duration")
      .isFloat({ min: 30, max: 120 })
      .withMessage("Duration cannot exceed more than 120min"),
    check("description")
      .isLength({ min: 0, max: 300 })
      .withMessage("Descripion cannot be more than 300 words")
    // check("price")
    //   .isInt({ min: 0, max: 500 })
    //   .withMessage("Minimun price is 0€ and Maximum is 500€ ")
  ],
  passport.authenticate("jwt"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      // Getting Event
      let event = await Event.create({ ...req.body, host: [req.user._id] });

      // Adding Event ID to the host (user) Event Array
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { events: event._id } },
        { new: true }
      );

      // Populating Hosts
      event = await Event.findById(event._id).populate("host");
      res.send(event);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

var upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: "meety-event",
    containerSecurity: "blob"
  })
});
router.put(
  "/:_id/picture",
  passport.authenticate("jwt"),
  upload.single("picture"),
  async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params._id,
        { picture: req.file.url },
        { new: true }
      );
      res.send(updatedEvent);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.put(
  "/:_id/join-event",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params._id,
        {
          $push: { participants: req.user._id },
          $inc: { participantsLength: 1 }
        },
        { new: true }
      );
      res.send(updatedEvent);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);
router.put(
  "/:_id/leave-event",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params._id,
        {
          $pull: { participants: req.user._id },
          $inc: { participantsLength: -1 }
        },
        { new: true }
      );
      res.send(updatedEvent);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

router.put("/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    // Getting the event
    const event = await Event.findById(req.params.id);

    // Checking if the logged in user is one of the host of the event
    const isUserHost = event.host.includes(req.user._id);

    if (isUserHost) {
      // If the user is the host then allowing to update the event
      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        { $set: { ...req.body } },
        { new: true }
      );

      // Sending the updated event
      res.send(updatedEvent);
    } else {
      // Else letting the client know that the user is not the host of this event
      res.status(401).send("You are not authorized to update this event.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.delete("/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    res.send({ message: "Event Deleted", deletedEvent });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
