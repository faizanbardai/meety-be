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
      required: true,
      minlength: 10,
      maxlength: 300
    },
    following: {
      type: []
    },
    followers: {
      type: []
    }
  },
  { timestamps: true }
);

const userCollections = mongoose.model("Host", userSchema);
module.exports = userCollections;
