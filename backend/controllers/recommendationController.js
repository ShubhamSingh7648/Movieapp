const MovieRecommendation = require('../models/MovieRecommendation');
const recommendationEngine = require('../services/recommendationEngine');

// @desc    Get user's personalized recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if cached recommendations exist
    let recommendations = await MovieRecommendation.findOne({ userId });
    
    // If no recommendations or they're stale, generate new ones
    if (!recommendations || recommendations.isStale) {
      console.log('Generating fresh recommendations...');
      
      const newRecommendations = await recommendationEngine.generateRecommendations(userId);
      
      // Save to database
      await recommendationEngine.saveRecommendations(userId, newRecommendations);
      
      // Fetch the saved recommendations
      recommendations = await MovieRecommendation.findOne({ userId });
    }
    
    res.status(200).json({
      success: true,
      data: recommendations.recommendations,
      lastUpdated: recommendations.lastUpdated
    });
    
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// @desc    Manually trigger recommendation regeneration
// @route   POST /api/recommendations/generate
// @access  Private
exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`Manually generating recommendations for user ${userId}`);
    
    const recommendations = await recommendationEngine.generateRecommendations(userId);
    await recommendationEngine.saveRecommendations(userId, recommendations);
    
    res.status(200).json({
      success: true,
      message: 'Recommendations generated successfully',
      count: recommendations.length,
      data: recommendations
    });
    
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};
