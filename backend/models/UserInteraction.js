const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: String, // IMDB ID
    required: true
  },
  interactionType: {
    type: String,
    enum: ['favorite', 'playlist', 'view'],
    required: true
  },
  weight: {
    type: Number,
    default: function() {
      switch(this.interactionType) {
        case 'favorite': return 3;
        case 'playlist': return 2;
        case 'view': return 1;
        default: return 1;
      }
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for fast queries
userInteractionSchema.index({ userId: 1, movieId: 1 });
userInteractionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
