const express = require("express");
const router = express.Router();
const {registerUser,loginUser,uploadPicture,latestUserFive,findNearbyUsers} = require("../controller/userController")
const verifyToken = require("../middleware/verifyToken")
// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/upload-picture", uploadPicture);
router.get("/latest-users", verifyToken, latestUserFive)
router.post("/near-by-users", verifyToken, findNearbyUsers)

module.exports = router;
