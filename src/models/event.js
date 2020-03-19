const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: String,
    duration: String,
    picture: {
      type: String,
      default: "https://via.placeholder.com/300"
    },
    description: String,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    host: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    price:  Number,
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    link: String,
    comments: [
      {
        user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        text: String,
        date: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
