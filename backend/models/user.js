const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String, default: "Hey, There I am using chat app" },
    lastSeen: { type: Date, default: Date.now },
    date: { type: Date, default: Date.now }
  });
  module.exports = mongoose.model('User', UserSchema); 