const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  credits: { type: Number, default: 0 },
  referAndEarn: { type: Number, default: 0 },
  subscription: { type: Boolean, default: false },
  feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
  poolMap: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pool" }],
  profileImage: {
    type: String,
    default: "https://i.pinimg.com/474x/b5/e5/fc/b5e5fc940044d2f862acbd07b9da35b2.jpg",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User ;
