// api.js

const API_KEY = "7140804c";
const BASE_URL = "https://www.omdbapi.com/";

export const getPopularMovies = async () => {
  const response = await fetch(`${BASE_URL}?s=Avengers&apikey=${API_KEY}`);
  const data = await response.json();
  return data.Search || []; // OMDb returns data.Search array
};

export const searchMovie = async (query) => {
  const response = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
  const data = await response.json();
  return data.Search || [];
};
