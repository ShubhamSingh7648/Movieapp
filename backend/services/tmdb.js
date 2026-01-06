const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Get movie details by IMDB ID
const getMovieByImdbId = async (imdbId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/find/${imdbId}`, {
      params: {
        api_key: TMDB_API_KEY,
        external_source: 'imdb_id'
      }
    });
    
    return response.data.movie_results[0] || null;
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    return null;
  }
};

// Get movie trailer
const getMovieTrailer = async (imdbId) => {
  try {
    const movie = await getMovieByImdbId(imdbId);
    if (!movie) return null;

    const videosResponse = await axios.get(
      `${TMDB_BASE_URL}/movie/${movie.id}/videos`,
      {
        params: { api_key: TMDB_API_KEY }
      }
    );

    const trailer = videosResponse.data.results.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    return trailer ? { videoId: trailer.key, title: trailer.name } : null;
  } catch (error) {
    console.error('Error fetching trailer:', error.message);
    return null;
  }
};

// Search actors
const searchActors = async (query) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query
      }
    });
    
    return response.data.results.slice(0, 10);
  } catch (error) {
    console.error('Error searching actors:', error.message);
    return [];
  }
};

// Get actor details
const getActorDetails = async (actorId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/person/${actorId}`, {
      params: { api_key: TMDB_API_KEY }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching actor:', error.message);
    return null;
  }
};

// Get actor filmography
const getActorFilmography = async (actorId) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/person/${actorId}/movie_credits`,
      {
        params: { api_key: TMDB_API_KEY }
      }
    );
    
    return response.data.cast.sort((a, b) => 
      new Date(b.release_date) - new Date(a.release_date)
    );
  } catch (error) {
    console.error('Error fetching filmography:', error.message);
    return [];
  }
};

module.exports = {
  getMovieByImdbId,
  getMovieTrailer,
  searchActors,
  getActorDetails,
  getActorFilmography
};
