const User = require("../modal/userModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uploadImageCloudinary = require("../middleware/multerMiddleware");

// Controller Functions
const registerUser = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, location } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, location });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error" + error)
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const uploadPicture = async (req, res) => {
  try {
    const token = req.header("Authorization").split(" ")[1]; // Get token from headers
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const userId = decoded.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload image to Cloudinary
    const result = await uploadImageCloudinary(req.file);

    // Update user profile with image URL
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: result },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Profile picture uploaded successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, uploadPicture };
