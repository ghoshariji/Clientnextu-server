const express = require("express");
const router = express.Router();
const {
    createFeedback,
    getFeedBack,
    increaseLike
} = require("../controller/feedbackController");
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Routes
router.post("/create-feedback",upload.single("image"), createFeedback);
router.get("/get-feedback",getFeedBack);
router.post("/like/:id",increaseLike);

module.exports = router;
