const express = require("express");
const router = express.Router();
const {registerUser,loginUser,uploadPicture} = require("../controller/userController")
// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/upload-picture", uploadPicture);

module.exports = router;
