const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    imgHost: {
      type: String,
      default: "https://via.placeholder.com/300"
    },
    aboutMe: {
      type: String,
      minlength: 10,
      maxlength: 300
    },
    following: { type: Schema.Types.ObjectId },
    followers: { type: Schema.Types.ObjectId },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }]
  },
  { timestamps: true }
);

const userCollections = mongoose.model("Host", userSchema);
module.exports = userCollections;
