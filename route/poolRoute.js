const express = require("express");
const router = express.Router();
const {
  createPool,
  deletePool,
  getUserPools,
  bookUserPool
} = require("../controller/poolController");
const verifyToken = require("../middleware/verifyToken");
// Routes
router.post("/create-pool", createPool);
router.post("/delete-pool", deletePool);
router.get("/user-pools", verifyToken, getUserPools);
router.put("/book-pool/:id", verifyToken, bookUserPool);


module.exports = router;
