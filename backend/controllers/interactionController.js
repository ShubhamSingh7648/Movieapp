const UserInteraction = require('../models/UserInteraction');
const MovieRecommendation = require('../models/MovieRecommendation');

// @desc    Track user interaction with a movie
// @route   POST /api/interactions
// @access  Private
exports.trackInteraction = async (req, res) => {
  try {
    const { movieId, interactionType, movieData } = req.body;
    const userId = req.user._id;

    // Validate interaction type
    if (!['favorite', 'playlist', 'view'].includes(interactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interaction type'
      });
    }

    // Check if interaction already exists (for views, we allow multiple)
    if (interactionType !== 'view') {
      const existingInteraction = await UserInteraction.findOne({
        userId,
        movieId,
        interactionType
      });

      if (existingInteraction) {
        return res.status(200).json({
          success: true,
          message: 'Interaction already tracked',
          data: existingInteraction
        });
      }
    }

    // Create new interaction
    const interaction = await UserInteraction.create({
      userId,
      movieId,
      interactionType
    });

    // Mark user's recommendations as stale (need regeneration)
    await MovieRecommendation.updateOne(
      { userId },
      { $set: { isStale: true } },
      { upsert: false }
    );

    res.status(201).json({
      success: true,
      message: 'Interaction tracked successfully',
      data: interaction
    });
  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track interaction',
      error: error.message
    });
  }
};

// @desc    Get user's interaction history
// @route   GET /api/interactions
// @access  Private
exports.getInteractions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 50 } = req.query;

    const query = { userId };
    if (type) {
      query.interactionType = type;
    }

    const interactions = await UserInteraction
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    console.error('Get interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get interactions',
      error: error.message
    });
  }
};
