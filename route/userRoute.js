const express = require("express");
const router = express.Router();
const {registerUser,loginUser,uploadPicture,latestUserFive,findNearbyUsers,getUserData,updateProfile,getUserPoolData} = require("../controller/userController")
const verifyToken = require("../middleware/verifyToken")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/upload-picture", upload.single("profileImage"), uploadPicture);
router.put("/update-profile-name",verifyToken, updateProfile);
router.get("/latest-users", verifyToken, latestUserFive)
router.post("/near-by-users", verifyToken, findNearbyUsers)
router.get("/get-profile", verifyToken, getUserData)
router.get("/get-user-pool", verifyToken, getUserPoolData)

module.exports = router;
