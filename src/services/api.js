// OMDB API
const OMDB_API_KEY = "7140804c";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

// Backend API - Using proxy or direct URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://movieapp-1-2flz.onrender.com";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for authenticated requests
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log('Fetching:', url);
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============ OMDB API Functions ============
export const getPopularMovies = async () => {
  try {
    const response = await fetch(`${OMDB_BASE_URL}?s=Avengers&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    return data.Search || [];
  } catch (error) {
    console.error('OMDB API Error:', error);
    return [];
  }
};

export const searchMovie = async (query) => {
  try {
    const response = await fetch(`${OMDB_BASE_URL}?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    return data.Search || [];
  } catch (error) {
    console.error('OMDB API Error:', error);
    return [];
  }
};

// ============ Auth API Functions ============
export const register = async (name, email, password) => {
  return authFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

export const login = async (email, password) => {
  return authFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getCurrentUser = async () => {
  return authFetch(`${API_BASE_URL}/auth/me`);
};

// ============ User API Functions ============
export const updateProfile = async (name, email) => {
  return authFetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    body: JSON.stringify({ name, email }),
  });
};

export const updateProfilePicture = async (imageBase64) => {
  return authFetch(`${API_BASE_URL}/users/profile-picture`, {
    method: 'PUT',
    body: JSON.stringify({ profilePicture: imageBase64 }),
  });
};

// ============ Favorites API Functions ============
export const getFavorites = async () => {
  return authFetch(`${API_BASE_URL}/users/favorites`);
};

export const addToFavorites = async (movie) => {
  return authFetch(`${API_BASE_URL}/users/favorites`, {
    method: 'POST',
    body: JSON.stringify(movie),
  });
};

export const removeFromFavorites = async (imdbID) => {
  return authFetch(`${API_BASE_URL}/users/favorites/${imdbID}`, {
    method: 'DELETE',
  });
};

// ============ Playlist API Functions ============
export const getPlaylists = async () => {
  return authFetch(`${API_BASE_URL}/users/playlists`);
};

export const createPlaylist = async (name) => {
  return authFetch(`${API_BASE_URL}/users/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const deletePlaylist = async (playlistId) => {
  return authFetch(`${API_BASE_URL}/users/playlists/${playlistId}`, {
    method: 'DELETE',
  });
};

export const addMovieToPlaylist = async (playlistId, movie) => {
  return authFetch(`${API_BASE_URL}/users/playlists/${playlistId}/movies`, {
    method: 'POST',
    body: JSON.stringify(movie),
  });
};

export const removeMovieFromPlaylist = async (playlistId, imdbID) => {
  return authFetch(`${API_BASE_URL}/users/playlists/${playlistId}/movies/${imdbID}`, {
    method: 'DELETE',
  });
};