const express = require("express");
const Event=require("../models/event")
const router = express.Router();

router.get("/", async(req, res) => {
  try {
    const event = await Event.find();
    res.status(200).send(event)
  } catch (error) {
    console.log(error);
    res.send(error);
  }
  // res.send("Hi, I'm event route");
});

router.get("/:id", async(req, res) => {
  try{
    const event=await Event.findById(req.params.id)
    res.send(event)
  }
  catch(error){
  console.log(error)
  res.status(400).send
  }
  // res.send("Hi, I'm event route");
});

router.post("/", async(req, res) => {
  try {
    console.log(req.body);
    const event=await  Event.create(req.body)
    event.save();
    res.send(event);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
  // res.send("Hi, I'm event route");
});

router.put("/:id", async(req, res) => {
  try {
    const newEvent = await Event.findOneAndUpdate(
        {_id: req.params.id},
        {$set: {...req.body}},
        {new: true}
    );
    res.send(newEvent);
} catch (error) {
    console.log(error)
    res.status(400).send(error);
}
  // res.send("Hi, I'm event route");
});

router.delete("/:id", async(req, res) => {
  try {
    const deletedEvent=await Event.findOneAndDelete({_id: req.params.id});
    res.send(deletedEvent);
} catch (error) {
    console.log(error)
    res.status(400).send(error);
}
  // res.send("Hi, I'm event route");
});

module.exports = router;
