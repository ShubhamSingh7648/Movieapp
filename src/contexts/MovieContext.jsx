import React, { createContext, useState, useContext, useEffect } from "react";
import { getFavorites, addToFavorites, removeFromFavorites, trackInteraction } from "../services/api";
import { useAuth } from "./authContext";


const MovieContext = createContext();
export const useMovieContext = () => useContext(MovieContext);


export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();


  // Load favorites from backend when user logs in
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);


  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };


  const addToFavorite = async (movie) => {
    try {
      // Optimistic update
      setFavorites((prev) => [...prev, movie]);
      
      // Save to backend
      await addToFavorites({
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Type: movie.Type
      });
      
      // ✨ Track interaction (marks recommendations as stale)
      try {
        await trackInteraction(movie.imdbID, 'favorite');
        console.log('✅ Tracked favorite interaction for:', movie.Title);
      } catch (err) {
        console.error('❌ Failed to track favorite interaction:', err);
        // Don't throw - tracking is not critical
      }
      
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      // Revert on error
      setFavorites((prev) => prev.filter((m) => m.imdbID !== movie.imdbID));
      throw error;
    }
  };


  const removeFromFavorite = async (movieId) => {
    try {
      // Optimistic update
      const previousFavorites = [...favorites];
      setFavorites((prev) => prev.filter((movie) => movie.imdbID !== movieId));
      
      // Remove from backend
      await removeFromFavorites(movieId);
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      // Revert on error
      setFavorites(previousFavorites);
      throw error;
    }
  };


  const isFavorite = (movieId) => {
    return favorites.some((movie) => movie.imdbID === movieId);
  };


  const value = {
    favorites,
    loading,
    addToFavorite,
    removeFromFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };


  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};
