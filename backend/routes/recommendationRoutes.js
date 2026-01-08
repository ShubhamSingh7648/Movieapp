const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getRecommendations,
  generateRecommendations
} = require('../controllers/recommendationController');

// Apply protect middleware to all routes
router.use(protect);

// Get recommendations (cached or generate if needed)
router.get('/', getRecommendations);

// Manually trigger recommendation generation
router.post('/generate', generateRecommendations);

module.exports = router;
