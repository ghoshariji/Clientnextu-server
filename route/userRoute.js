const express = require("express");
const router = express.Router();
const {registerUser,loginUser,uploadPicture,latestUserFive,findNearbyUsers,getUserData} = require("../controller/userController")
const verifyToken = require("../middleware/verifyToken")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/upload-picture", upload.single("profileImage"), uploadPicture);
router.get("/latest-users", verifyToken, latestUserFive)
router.post("/near-by-users", verifyToken, findNearbyUsers)
router.get("/get-profile", verifyToken, getUserData)

module.exports = router;
