const express = require("express");
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
  try {
    const event = await Event.findById(req.params.id);
    res.send(event);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// router.get("/upcoming", async (req, res) => {
//   try {
//     const events = await Event.find()
//       .where("schedule")
//       .gte("Mar 01 2020")
//       .lt("Mar 01 2020");
//     res.send(events);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error);
//   }
// });

router.post(
  "/",
  [
    check("name")
      .isLength({ min: 3, max: 25 })
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
      .isLength({ min: 25, max: 300 })
      .withMessage("Descripion cannot be more than 300 words"),
    check("price")
      .isInt({ min: 150, max: 500 })
      .withMessage("Minimun price is 150€ and Maximum is 500€ ")
  ],
  passport.authenticate("jwt"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const event = await Event.create({ ...req.body, host: [req.user._id] });
      const eventIDAddedToUserEventArray = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { events: event._id } },
        { new: true }
      );
      res.send({ event });
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

router.put("/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    const newEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body } },
      { new: true }
    );
    res.send(newEvent);
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
