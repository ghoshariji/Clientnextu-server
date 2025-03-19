const jwt = require("jsonwebtoken");
const User = require("../modal/userModal");
const Pool = require("../modal/poolModal");

const createPool = async (req, res) => {
  try {
    const { activity, destination, time, location, comments } = req.body;

    // Extract and verify the token
    const token = req.header("Authorization").split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("poolMap");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the user already has at least two pools with isBooked true
    const bookedPools = user.poolMap.filter((pool) => pool.isUserPoolCreated).length;
    if (bookedPools >= 2) {
      return res.status(400).json({ message: "Maximum pool limit exceeded" });
    }

    // Create and save the pool entry
    const pool = new Pool({
      userPool: user._id, // Store user ID
      activity,
      destination,
      time,
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
      },
      comments,
      isBooked: false,
    });

    await pool.save();

    // Associate the pool with the user
    user.poolMap.push(pool._id);
    await user.save();

    res.status(201).json({ message: "Pool created successfully", pool });
  } catch (error) {
    console.error("Error creating pool:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
const getUserPools = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token

    // Find all pools where the user is either the creator (userPool) or has booked (userBook)
    const userPools = await Pool.find({
      $or: [{ userPool: userId }, { userBook: userId }]
    });

    if (!userPools.length) {
      return res.status(404).json({ message: "No pools found for this user" });
    }

    res.status(200).json({ pools: userPools });
  } catch (error) {
    console.error("Error fetching pools:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const bookUserPool = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware
    const poolId = req.params.id;

    console.log(`User ${userId} is booking Pool ${poolId}`);

    // Find the pool
    const pool = await Pool.findById(poolId);
    if (!pool) {
      return res.status(404).json({ message: "Pool not found" });
    }

    // Check if already booked
    if (pool.isBooked) {
      return res.status(400).json({ message: "Pool is already booked" });
    }

    // Update pool with userBook and isBooked
    pool.userBook = userId;
    pool.isBooked = true;
    await pool.save();

    // Add the pool to user's poolMap
    await User.findByIdAndUpdate(userId, {
      $push: { poolMap: pool._id }
    });

    res.status(200).json({
      message: "Pool booked successfully!",
      pool
    });
  } catch (error) {
    console.error("Error booking pool:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const deletePool = async (req, res) => {
  try {
    const { poolId } = req.body;
    const token = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const pool = await Pool.findById(poolId);
    if (!pool) return res.status(404).json({ message: "Pool not found" });

    await Pool.findByIdAndDelete(poolId);
    user.poolMap = user.poolMap.filter((id) => id.toString() !== poolId);
    await user.save();

    res.json({ message: "Pool deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { createPool, deletePool,getUserPools,bookUserPool };
