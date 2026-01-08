const express = require('express');
const router = express.Router();
const { getTrailer } = require('../controllers/movieController');

// Public route - no authentication needed for trailers
router.get('/:imdbID/trailer', getTrailer);

module.exports = router;
