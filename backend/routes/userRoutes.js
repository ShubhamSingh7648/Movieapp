const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  updateProfilePicture
} = require('../controllers/userController');

const {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  addMovieToPlaylist,
  removeMovieFromPlaylist
} = require('../controllers/playlistController');

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

// Playlist routes
router.route('/playlists')
  .get(getPlaylists)
  .post(createPlaylist);

router.delete('/playlists/:playlistId', deletePlaylist);

// Playlist movies routes
router.post('/playlists/:playlistId/movies', addMovieToPlaylist);
router.delete('/playlists/:playlistId/movies/:imdbID', removeMovieFromPlaylist);

module.exports = router;