const jwt = require("jsonwebtoken");
const Pool = require("../modal/poolModal");
const User = require("../modal/userModal");
const Chat = require("../modal/chatModal");

// Fetch matched pool user details
const getPoolUsers = async (req, res) => {
  try {
    // Decode the token and extract user ID
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find all pool entries where the user is either userPool or userBook
    const pools = await Pool.find({
      $or: [{ userPool: userId }, { userBook: userId }],
    }).select("userPool userBook");

    // Extract opposite user IDs (if userPool = userId, take userBook, and vice versa)
    const oppositeUserIds = pools
      .map((pool) =>
        pool.userPool.toString() === userId ? pool.userBook : pool.userPool
      )
      .filter((id) => id); // Remove null values

    if (oppositeUserIds.length === 0) {
      return res
        .status(200)
        .json({ message: "No matched users found", data: [] });
    }

    // Fetch user details with optimized query
    const users = await User.find({ _id: { $in: oppositeUserIds } }).select(
      "name profileImage"
    );

    return res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching pool users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id; // Extracted from JWT token

    if (!receiverId || !message.trim()) {
      return res
        .status(400)
        .json({ error: "Receiver ID and message are required!" });
    }

    const newChat = new Chat({ senderId, receiverId, message });
    await newChat.save();

    res.status(201).json({
      message: "Message sent successfully!",
      data: {
        _id: newChat._id,
        senderId,
        receiverId,
        message,
        createdAt: newChat.createdAt, // Ensure timestamp is included
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const senderId = req.user.id; // Extracted from JWT token
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required!" });
    }

    const chats = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: 1 }) // Sort in ascending order (oldest to newest)

    res.status(200).json({ message: "Chat history retrieved!", data: chats });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = { getPoolUsers, sendMessage, getChatHistory };
