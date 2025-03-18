
const jwt = require("jsonwebtoken");
const User = require("../modal/userModal");
const Pool = require("../modal/poolModal");


const createPool = async (req, res) => {
    try {
      const { destination, time, location } = req.body;
      const token = req.header("Authorization").split(" ")[1];
      const decoded = jwt.verify(token,  process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const pool = new Pool({ destination, time, location, isBooked: false });
      await pool.save();
  
      user.poolMap.push(pool._id);
      await user.save();
  
      res.status(201).json({ message: "Pool created successfully", pool });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  const acceptPool = async (req, res) => {
    try {
      const { poolId } = req.body;
      const token = req.header("Authorization").split(" ")[1];
      const decoded = jwt.verify(token,  process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const pool = await Pool.findById(poolId);
      if (!pool) return res.status(404).json({ message: "Pool not found" });
  
      if (pool.isBooked) return res.status(400).json({ message: "Pool already booked" });
  
      pool.partner = user._id
      pool.isBooked = true;
      await pool.save();
  
      user.poolMap.push(pool._id);
      await user.save();
  
      res.json({ message: "Pool accepted successfully", pool });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  const deletePool = async (req, res) => {
    try {
      const { poolId } = req.body;
      const token = req.header("Authorization").split(" ")[1];
      const decoded = jwt.verify(token,  process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const pool = await Pool.findById(poolId);
      if (!pool) return res.status(404).json({ message: "Pool not found" });
  
      await Pool.findByIdAndDelete(poolId);
      user.poolMap = user.poolMap.filter(id => id.toString() !== poolId);
      await user.save();
  
      res.json({ message: "Pool deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  };
  
  module.exports = { createPool, acceptPool, deletePool };
  