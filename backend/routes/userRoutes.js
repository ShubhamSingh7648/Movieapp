const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateProfilePicture
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all routes in this router
router.use(protect);

// Favorites routes
router.route('/favorites')
  .get(getFavorites)
  .post(addFavorite);

router.delete('/favorites/:imdbID', removeFavorite);

// Profile picture route
router.put('/profile-picture', updateProfilePicture);

module.exports = router;