const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageCloudinary = async (image) => {
  if (!image) throw new Error("No image provided");

  const buffer = image?.buffer || Buffer.from(await image.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_picture" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = uploadImageCloudinary;
