const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  filters: {
    genre: [String],
    yearMin: Number,
    yearMax: Number,
    minRating: Number,
    language: String
  },
  clickedMovieId: {
    type: String // IMDB ID
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for fast user queries
searchHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
