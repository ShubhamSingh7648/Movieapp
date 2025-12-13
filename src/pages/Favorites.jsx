import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import React from "react";

function Favorites() {
  const { favorites } = useMovieContext();

  if (favorites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg border border-zinc-700/50 shadow-2xl">
          <div className="text-8xl mb-6 animate-pulse">❤️</div>
          <h2 className="text-3xl font-bold text-white mb-4">No Favorites Yet</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Start adding movies to your favorites by clicking the heart icon on any movie card.
            <br />
            Your collection will appear here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-2">
          Your Favorites
        </h1>
        <p className="text-gray-400 text-lg">
          {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} in your collection
        </p>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favorites.map((movie) => (
          <MovieCard movie={movie} key={movie.imdbID} />
        ))}
      </div>
    </div>
  );
}

export default Favorites;