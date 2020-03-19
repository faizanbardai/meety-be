const express = require("express");
const Event = require("../models/event");
const passport = require("passport");
const multer = require("multer");
const MulterAzureStorage = require("multer-azure-storage");

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

router.post("/", passport.authenticate("jwt"), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, host: [req.user._id] });
    event.save();
    res.send(event);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

var upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: "meety-event",
    containerSecurity: "blob"
  })
});
router.post(
  "/image",
  passport.authenticate("jwt"),
  upload.single("image"),
  async (req, res) => {
    console.log(req.file);
    console.log(req.body);
    res.send("ok");
  }
);

router.put("/:id", passport.authenticate("jwt"), async (req, res) => {
  try {
    const newEvent = await Event.findOneAndUpdate(
      { _id: req.params.id },
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
