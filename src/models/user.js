const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    username: String,
    facebook: Object,
    name: String,
    picture: {
      type: String,
      default: "https://via.placeholder.com/300"
    },
    aboutMe: String,
    following: [{ type: Schema.Types.ObjectId }],
    followers: [{ type: Schema.Types.ObjectId }],
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }]
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
