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
          <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-base md:text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-md w-full">
          <div className="text-red-500 text-4xl md:text-5xl mb-4">⚠️</div>
          <p className="text-gray-300 text-base md:text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
      {movies.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-md w-full">
            <div className="text-5xl md:text-6xl mb-4">🎬</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No movies found</h2>
            <p className="text-gray-400 text-sm md:text-base">Try searching for something else</p>
          </div>
        </div>
      ) : (
        <>
          {/* Results Count - Mobile Only */}
          <div className="mb-4 md:hidden">
            <p className="text-gray-400 text-sm">
              {movies.length} {movies.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {/* Movies Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {movies.map((movie) => (
              <MovieCard movie={movie} key={movie.imdbID} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;