const mongoose = require("mongoose");


// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true }
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = { Feedback };
