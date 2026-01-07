const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'accepted'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);