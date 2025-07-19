import "../css/MovieCard.css";
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
    <div className="movie-card">
      <div className="movie-poster">
        <img src={movie.Poster} alt={movie.Title} />
        <div className="movie-overlay">
          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={onFavoriteClick}
          >
            ♥
          </button>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.Title}</h3>
        <p>{movie.Year}</p>
      </div>
    </div>
  );
}

export default MovieCard;
