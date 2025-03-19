const mongoose = require("mongoose");

// Pool Schema
const PoolSchema = new mongoose.Schema({
    userPool: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userBook: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    activity:{
        type:String,
        required:true
    },
    destination: { type: String, required: true },
    time: { type: String, required: true },
    comments:{
        type:String,
        required:true
    },
    location: {
        latitude: { type: Number, },
        longitude: { type: Number,}
    },
    isBooked: { type: Boolean, default: false },
    isUserPoolCreated:{
        type:Boolean,
        default:true
    }
});

const Pool = mongoose.model('Pool', PoolSchema);
module.exports = Pool;

