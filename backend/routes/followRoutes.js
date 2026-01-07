const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/followController');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

// Follow/Unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get followers/following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;