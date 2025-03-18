const mongoose = require("mongoose");

// Pool Schema
const PoolSchema = new mongoose.Schema({
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    time: { type: String, required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    isBooked: { type: Boolean, default: false }
});

const Pool = mongoose.model('Pool', PoolSchema);
module.exports = {  Pool };

