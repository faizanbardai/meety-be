const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const eventSchema = new mongoose.Schema(
  {
    name: String,
    schedule: Date,
    duration: Number,
    picture: {
      type: String,
      default: "https://via.placeholder.com/300"
    },
    description: String,
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    host: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    price: Number,
    like: [{ type: Schema.Types.ObjectId, ref: "User" }],
    link: String,
    comments: [
      {
        user: [{ type: Schema.Types.ObjectId, ref: "User" }],
        text: String,
        date: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
