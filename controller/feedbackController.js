const uploadImageCloudinary = require("../middleware/multerMiddleware");
const Feedback = require("../modal/feedbackModal");
const jwt = require("jsonwebtoken");
const Pool = require("../modal/poolModal"); // Adjust path as needed

const createFeedback = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from headers
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token
    const userId = decoded.id; // Extract user ID

    const { postId, message, rating } = req.body;
    let imageUrl = "";
    // Handle image upload if provided
    if (req.file) {
      const result = await uploadImageCloudinary(req.file);
      console.log(result);
      imageUrl = result.secure_url;
    }

    const feedback = new Feedback({
      postId,
      user: userId,
      message,
      rating,
      image: imageUrl,
    });

    await feedback.save();
    res
      .status(201)
      .json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getFeedBack = async (req, res) => {
  try {
    console.log("Fetching Feedback");
    const { page = 1, search = "" } = req.query;
    const limit = 10;
    const skip = (parseInt(page) - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { message: { $regex: search, $options: "i" } },
          { rating: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Fetch feedback with populated postId and user
    const feedbacks = await Feedback.find(searchQuery)
      .populate({
        path: "postId",
        model: Pool,
        select: "activity destination", // Select only activity and destination
      })
      .populate("user", "name profileImage") // Populate user with name
      .select("message rating image likes")
      .sort({ _id: -1 }) // Sort by latest
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(searchQuery);

    res.json({
      success: true,
      feedbacks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const increaseLike = async(req,res) =>{
  try {
    const { id } = req.params;

    // Increment the likes field by 1
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } }, // Increase likes by 1
      { new: true } // Return updated document
    );

    if (!updatedFeedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, likes: updatedFeedback.likes });
  } catch (error) {
    console.error("Error increasing like count:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { createFeedback, getFeedBack,increaseLike };
