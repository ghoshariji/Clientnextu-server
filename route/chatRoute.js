const express = require("express");
const router = express.Router();
const {
    getPoolUsers,
    sendMessage,
    getChatHistory
} = require("../controller/chatController");
const verifyToken = require("../middleware/verifyToken");
// Routes
router.get("/get-chat-list",getPoolUsers);
router.post("/send", verifyToken, sendMessage);

// GET → Retrieve chat history between two users
router.get("/history/:receiverId", verifyToken, getChatHistory);
module.exports = router;
