const User = require("../modal/userModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uploadImageCloudinary = require("../middleware/multerMiddleware");
const { getDistance } = require("geolib");
const geolib = require("geolib");

// Controller Functions
const registerUser = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, location });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error" + error);
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

const latestUserFive = async (req, res) => {
  try {
    console.log("Fetching latest users...");

    // Get the current user from the token
    const currentUser = await User.findById(req.user.id);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    // Fetch latest 5 users excluding the current user
    const latestUsers = await User.find({ _id: { $ne: req.user.id } }) // Exclude current user
      .sort({ _id: -1 }) // Sort by newest users
      .limit(5)
      .select("name email location profileImage");

    // Calculate distance for each user
    const formattedUsers = latestUsers.map((user) => {
      const distance = getDistance(
        {
          latitude: currentUser.location.latitude,
          longitude: currentUser.location.longitude,
        },
        { latitude: user.location.latitude, longitude: user.location.longitude }
      );

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        location: `${user.location.latitude}, ${user.location.longitude}`,
        distance: `${(distance / 1000).toFixed(1)} km away`,
        image: user.profileImage,
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const findNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate input
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    // Update the user's location in the database
    await User.findByIdAndUpdate(req.user.id, {
      location: { latitude, longitude },
    });

    // Fetch all users (excluding the requester)
    const allUsers = await User.find({ _id: { $ne: req.user.id } });

    // Filter users within 20km and extract only name, profileImage, and distance
    const nearbyUsers = allUsers
      .filter((user) => {
        if (!user.location || typeof user.location !== "object") return false;
        const { latitude: userLat, longitude: userLong } = user.location;
        if (typeof userLat !== "number" || typeof userLong !== "number")
          return false;

        const distance = geolib.getDistance(
          { latitude, longitude },
          { latitude: userLat, longitude: userLong }
        );

        return distance <= 20000; // 20km in meters
      })
      .map((user) => {
        const distance = geolib.getDistance(
          { latitude, longitude },
          {
            latitude: user.location.latitude,
            longitude: user.location.longitude,
          }
        );

        return {
          id:user._id,
          name: user.name,
          profileImage: user.profileImage,
          distance, // Distance in meters
        };
      });

    console.log(nearbyUsers);

    res.json(nearbyUsers);
  } catch (error) {
    console.error("Error fetching nearby users:", error);
    res.status(500).json({ error: "Server error while fetching matches" });
  }
};
module.exports = {
  registerUser,
  loginUser,
  uploadPicture,
  latestUserFive,
  findNearbyUsers,
};
