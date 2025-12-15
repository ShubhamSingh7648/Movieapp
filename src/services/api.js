// ================= OMDB API =================
const OMDB_API_KEY = "7140804c";
const OMDB_BASE_URL = "https://www.omdbapi.com/";

// ================= BACKEND API =================
// Use Vercel env variable, fallback to Render URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://movieapp-1-2flz.onrender.com";

// ================= AUTH TOKEN =================
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// ================= AUTH FETCH =================
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
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
    console.error("API Error:", error);
    throw error;
  }
};

// ================= OMDB FUNCTIONS =================
export const getPopularMovies = async () => {
  try {
    const res = await fetch(
      `${OMDB_BASE_URL}?s=Avengers&apikey=${OMDB_API_KEY}`
    );
    const data = await res.json();
    return data.Search || [];
  } catch (error) {
    console.error("OMDB API Error:", error);
    return [];
  }
};

export const searchMovie = async (query) => {
  try {
    const res = await fetch(
      `${OMDB_BASE_URL}?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`
    );
    const data = await res.json();
    return data.Search || [];
  } catch (error) {
    console.error("OMDB API Error:", error);
    return [];
  }
};

// ================= NEW: GET MOVIE DETAILS =================
export const getMovieDetails = async (imdbID) => {
  try {
    const res = await fetch(
      `${OMDB_BASE_URL}?i=${imdbID}&plot=full&apikey=${OMDB_API_KEY}`
    );
    const data = await res.json();
    
    if (data.Response === "False") {
      throw new Error(data.Error || "Movie not found");
    }
    
    return data;
  } catch (error) {
    console.error("OMDB API Error:", error);
    throw error;
  }
};

// ================= AUTH APIs =================
export const register = async (name, email, password) => {
  return authFetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
};

export const login = async (email, password) => {
  return authFetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const getCurrentUser = async () => {
  return authFetch(`${API_BASE_URL}/api/auth/me`);
};

// ================= USER APIs =================
export const updateProfile = async (name, email) => {
  return authFetch(`${API_BASE_URL}/api/users/profile`, {
    method: "PUT",
    body: JSON.stringify({ name, email }),
  });
};

export const updateProfilePicture = async (imageBase64) => {
  return authFetch(`${API_BASE_URL}/api/users/profile-picture`, {
    method: "PUT",
    body: JSON.stringify({ profilePicture: imageBase64 }),
  });
};

// ================= FAVORITES APIs =================
export const getFavorites = async () => {
  return authFetch(`${API_BASE_URL}/api/users/favorites`);
};

export const addToFavorites = async (movie) => {
  return authFetch(`${API_BASE_URL}/api/users/favorites`, {
    method: "POST",
    body: JSON.stringify(movie),
  });
};

export const removeFromFavorites = async (imdbID) => {
  return authFetch(
    `${API_BASE_URL}/api/users/favorites/${imdbID}`,
    {
      method: "DELETE",
    }
  );
};

// ================= PLAYLIST APIs =================
export const getPlaylists = async () => {
  return authFetch(`${API_BASE_URL}/api/users/playlists`);
};

export const createPlaylist = async (name) => {
  return authFetch(`${API_BASE_URL}/api/users/playlists`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
};

export const deletePlaylist = async (playlistId) => {
  return authFetch(
    `${API_BASE_URL}/api/users/playlists/${playlistId}`,
    {
      method: "DELETE",
    }
  );
};

export const addMovieToPlaylist = async (playlistId, movie) => {
  return authFetch(
    `${API_BASE_URL}/api/users/playlists/${playlistId}/movies`,
    {
      method: "POST",
      body: JSON.stringify(movie),
    }
  );
};

export const removeMovieFromPlaylist = async (playlistId, imdbID) => {
  return authFetch(
    `${API_BASE_URL}/api/users/playlists/${playlistId}/movies/${imdbID}`,
    {
      method: "DELETE",
    }
  );
};