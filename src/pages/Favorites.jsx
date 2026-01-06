import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import React from "react";

function Favorites() {
  const { favorites, loading } = useMovieContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-base md:text-lg">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl md:rounded-3xl p-8 md:p-12 max-w-lg w-full border border-zinc-700/50 shadow-2xl">
          <div className="text-6xl md:text-8xl mb-4 md:mb-6 animate-pulse">❤️</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">No Favorites Yet</h2>
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed">
            Start adding movies to your favorites by clicking the heart icon on any movie card.
            <br className="hidden md:block" />
            Your collection will appear here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-2">
          Your Favorites
        </h1>
        <p className="text-gray-400 text-sm md:text-lg">
          {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} in your collection
        </p>
      </div>

      {/* Movies Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {favorites.map((movie) => (
          <MovieCard movie={movie} key={movie.imdbID} />
        ))}
      </div>
    </div>
  );
}

export default Favorites;