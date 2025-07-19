import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovie, getPopularMovies } from "../services/api";
import "../css/Home.css";
import React from "react";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const results = await searchMovie(searchQuery);
      setMovies(results);
    } catch (err) {
      console.error(err);
      setError("Failed to search movies");
    }
  };

  return (
    <div className="Home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.imdbID} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
