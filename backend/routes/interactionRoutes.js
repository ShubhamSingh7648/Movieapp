const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  trackInteraction,
  getInteractions
} = require('../controllers/interactionController');

// Apply protect middleware to all routes
router.use(protect);

// Interaction routes
router.route('/')
  .post(trackInteraction)
  .get(getInteractions);

module.exports = router;
