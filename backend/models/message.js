const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
    sId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // receiver id
    text: { type: String },
    image: { type: String }, // URL to the image if any
    createdAt: { type: Date, default: Date.now }
  });
  module.exports = mongoose.model('Message', MessageSchema);