const mongoose = require("mongoose");


// Feedback Schema
const FeedbackSchema = new mongoose.Schema({
    postId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Pool', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    rating: { type: String, min: 1, max: 5, required: true },
    image: { type: String,default:""}, // This will store the image URL or file path
    likes:{
        type:Number,
        default:0
    },

});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;
