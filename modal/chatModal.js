const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing the User model
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing the User model
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true, // Removes unnecessary spaces
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Indexing for faster retrieval
chatSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
