import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovie, getPopularMovies } from "../services/api";
import React from "react";

function Home({ searchQuery }) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load popular movies on initial mount
  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
      } catch (err) {
        console.error(err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };
    loadPopularMovies();
  }, []);

  // Handle search when searchQuery changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery && searchQuery.trim()) {
        setLoading(true);
        try {
          const results = await searchMovie(searchQuery);
          setMovies(results);
          setError(null);
        } catch (err) {
          console.error(err);
          setError("Failed to search movies");
        } finally {
          setLoading(false);
        }
      }
    };
    performSearch();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-300 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {movies.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-12 max-w-md">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-white mb-2">No movies found</h2>
            <p className="text-gray-400">Try searching for something else</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.imdbID} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;