const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUserProfile
} = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

// Search routes
router.get('/users', searchUsers);
router.get('/profile/:username', getUserProfile);

module.exports = router;