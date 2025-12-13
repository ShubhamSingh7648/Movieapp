const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateProfilePicture
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/favorites')
  .get(getFavorites)
  .post(addFavorite);

router.delete('/favorites/:imdbID', removeFavorite);
router.put('/profile-picture', updateProfilePicture);

module.exports = router;