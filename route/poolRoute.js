const express = require("express");
const router = express.Router();
const {
  createPool,
  acceptPool,
  deletePool,
} = require("../controller/poolController");
// Routes
router.post("/create-pool", createPool);
router.post("/add-partner-pool", acceptPool);
router.post("/delete-pool", deletePool);

module.exports = router;
