const { getMovieTrailer } = require('../services/tmdb');

// @desc    Get movie trailer by IMDB ID
// @route   GET /api/movies/:imdbID/trailer
// @access  Public (no auth needed to view trailers)
exports.getTrailer = async (req, res) => {
  try {
    const { imdbID } = req.params;
    
    console.log(`🎬 Fetching trailer for IMDB ID: ${imdbID}`);
    
    const trailer = await getMovieTrailer(imdbID);
    
    if (!trailer) {
      return res.status(404).json({
        success: false,
        message: 'No trailer found for this movie'
      });
    }
    
    res.status(200).json({
      success: true,
      data: trailer
    });
    
  } catch (error) {
    console.error('Get trailer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trailer',
      error: error.message
    });
  }
};
