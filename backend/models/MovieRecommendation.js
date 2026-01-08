const mongoose = require('mongoose');

const movieRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One recommendation doc per user
  },
  recommendations: [
    {
      movieId: {
        type: String, // IMDB ID
        required: true
      },
      title: String,
      year: String,
      poster: String,
      score: {
        type: Number,
        required: true
      },
      reason: {
        type: String,
        enum: [
          'collaborative', // "Users like you loved this"
          'content_based', // "Based on your favorites"
          'social', // "Trending with people you follow"
          'genre_match' // "Similar to movies you liked"
        ],
        required: true
      },
      reasonText: {
        type: String, // Human-readable reason
        required: true
      }
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isStale: {
    type: Boolean,
    default: false // Mark true when user adds favorite/follows someone
  }
});

// Index for fast lookups
movieRecommendationSchema.index({ userId: 1 });
movieRecommendationSchema.index({ isStale: 1, lastUpdated: 1 });

module.exports = mongoose.model('MovieRecommendation', movieRecommendationSchema);
