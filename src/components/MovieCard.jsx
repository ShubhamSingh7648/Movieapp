import React from "react";
import { useMovieContext } from "../contexts/MovieContext";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorite, removeFromFavorite } = useMovieContext();
  const favorite = isFavorite(movie.imdbID);

  function onFavoriteClick(e) {
    e.preventDefault();
    if (favorite) removeFromFavorite(movie.imdbID);
    else addToFavorite(movie);
  }

  return (
    <div className="group relative bg-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-2 border border-zinc-700/50 hover:border-red-600/50">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        <img 
          src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster"} 
          alt={movie.Title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
        
        {/* Favorite Button */}
        <button
          onClick={onFavoriteClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 transform hover:scale-110 active:scale-95 z-10 ${
            favorite 
              ? "bg-red-600 text-white shadow-lg shadow-red-600/50" 
              : "bg-zinc-900/70 text-gray-400 hover:bg-zinc-800 hover:text-red-500"
          }`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${favorite ? 'scale-110' : ''}`}
            fill={favorite ? "currentColor" : "none"}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>

        {/* Year Badge */}
        <div className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-gray-300 border border-zinc-700/50">
          {movie.Year}
        </div>
      </div>
      
      {/* Movie Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-red-500 transition-colors duration-300">
          {movie.Title}
        </h3>
        
        {movie.Type && (
          <p className="text-gray-500 text-xs uppercase tracking-wider">
            {movie.Type}
          </p>
        )}
      </div>
    </div>
  );
}

export default MovieCard;