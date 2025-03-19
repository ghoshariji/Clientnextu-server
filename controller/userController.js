const User = require("../modal/userModal");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uploadImageCloudinary = require("../middleware/multerMiddleware");
const { getDistance } = require("geolib");
const geolib = require("geolib");
const Pool = require("../modal/poolModal");

// Controller Functions
const registerUser = async (req, res) => {
  try {
    const { name, email, password, location, age } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, location, age });
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
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No valid token" });
    }

    const token = authHeader.split(" ")[1]; // ✅ Extract token properly
    console.log("Received Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Verify token
    const userId = decoded.id;

    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload image to Cloudinary
    const result = await uploadImageCloudinary(req.file);

    console.log(result);
    // Update user profile with image URL
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: result.secure_url }, // ✅ Store only the URL string
      { new: true }
    );
    res.status(200).json({
      message: "Profile picture uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("JWT Verification Error:", error);
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
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    // Update the user's current location in the database
    await User.findByIdAndUpdate(req.user.id, {
      location: { latitude, longitude },
    });

    // Fetch all users except the requester
    const allUsers = await User.find({ _id: { $ne: req.user.id } });

    // Filter users within 10 km
    const nearbyUsers = allUsers
      .filter((user) => {
        if (!user.location || typeof user.location !== "object") return false;
        const { latitude: userLat, longitude: userLong } = user.location;
        if (!userLat || !userLong || isNaN(userLat) || isNaN(userLong))
          return false;

        const distance = geolib.getDistance(
          { latitude, longitude },
          { latitude: userLat, longitude: userLong }
        );

        return distance <= 10000; // 10 km
      })
      .map((user) => {
        const distanceInMeters = geolib.getDistance(
          { latitude, longitude },
          { latitude: user.location.latitude, longitude: user.location.longitude }
        );

        const distanceInKm = geolib.convertDistance(distanceInMeters, "km");

        return {
          id: user._id,
          name: user.name,
          profileImage: user.profileImage,
          distance: distanceInKm.toFixed(2) + " km",
          meters: distanceInMeters + " m",
        };
      });

    // Fetch all pools except those created by the requesting user
    const allPools = await Pool.find({ userPool: { $ne: req.user.id } });

    // Filter pools within 10 km
    const nearbyPools = allPools
      .filter((pool) => {
        if (!pool.location || typeof pool.location !== "object") return false;
        const { latitude: poolLat, longitude: poolLong } = pool.location;
        if (!poolLat || !poolLong || isNaN(poolLat) || isNaN(poolLong))
          return false;

        const distance = geolib.getDistance(
          { latitude, longitude },
          { latitude: poolLat, longitude: poolLong }
        );

        return distance <= 10000; // 10 km
      })
      .map((pool) => {
        const distanceInMeters = geolib.getDistance(
          { latitude, longitude },
          { latitude: pool.location.latitude, longitude: pool.location.longitude }
        );

        const distanceInKm = geolib.convertDistance(distanceInMeters, "km");

        return {
          id: pool._id,
          activity: pool.activity,
          destination: pool.destination,
          time: pool.time,
          comments: pool.comments,
          userPool: pool.userPool,
          distance: distanceInKm.toFixed(2) + " km",
          meters: distanceInMeters + " m",
        };
      });

    console.log({ nearbyUsers, nearbyPools });

    res.json({
      nearbyUsers,
      totalUsers: nearbyUsers.length,
      nearbyPools,
      totalPools: nearbyPools.length,
    });
  } catch (error) {
    console.error("Error fetching nearby users and pools:", error);
    res.status(500).json({ error: "Server error while fetching data" });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from the token
    const user = await User.findById(userId).select(
      "-password -feedbacks -poolMap"
    ); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getUserPoolData = async (req, res) => {
  try {
    console.log("Received Request for User Pool Data");

    const userPoolId = req.query.id; // Extract id from query params
    console.log("UserPool ID:", userPoolId);

    if (!userPoolId) {
      return res.status(400).json({ message: "Missing userPool ID" });
    }

    // Fetch user data with selected fields
    const userData = await User.findById(userPoolId).select("name email age profileImage");

    if (!userData) {
      return res.status(404).json({ message: "User Pool not found" });
    }

    return res.status(200).json({
      message: "Success",
      data: userData,
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  registerUser,
  loginUser,
  uploadPicture,
  latestUserFive,
  findNearbyUsers,
  getUserData,
  updateProfile,
  getUserPoolData
};
