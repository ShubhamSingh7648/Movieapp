import React, { useState, useEffect } from "react";
import { getRecommendations, generateRecommendations } from "../services/api";
import MovieCard from "./MovieCard";

function RecommendedMovies() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getRecommendations();
      setRecommendations(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Failed to load recommendations");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    try {
      setGenerating(true);
      await generateRecommendations();
      await loadRecommendations();
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
    } finally {
      setGenerating(false);
    }
  };

  const getReasonIcon = (reason) => {
    switch (reason) {
      case "collaborative":
        return "👥";
      case "social":
        return "🌟";
      case "content_based":
        return "🎬";
      case "genre_match":
        return "🎭";
      default:
        return "✨";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-200">
            ✨ Recommended for You
          </h2>
        </div>
        <div className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[250px]">
              <div className="w-full rounded-lg overflow-hidden">
                <div className="w-full h-[240px] sm:h-[300px] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"></div>
                <div className="h-5 mt-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded"></div>
                <div className="h-4 mt-2 w-3/5 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error or empty state
  if (error || recommendations.length === 0) {
    return (
      <div className="mb-10">
        <div className="bg-zinc-800 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            {error ? "No Recommendations Yet" : "Build Your Taste Profile"}
          </h3>
          <p className="text-gray-400 mb-4">
            Add some movies to your favorites to get personalized recommendations!
          </p>
          <button
            onClick={handleGenerateNew}
            disabled={generating}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Recommendations"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-200">
          ✨ Recommended for You
        </h2>
        <button
          onClick={handleGenerateNew}
          disabled={generating}
          className="text-sm px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-200 rounded-full font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {generating ? "Generating..." : "Refresh"}
        </button>
      </div>

      {/* Recommendations Carousel */}
      <div className="relative">
        <div className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden pb-4" style={{ scrollBehavior: "smooth" }}>
          {recommendations.map((rec) => {
            const movie = {
              imdbID: rec.movieId,
              Title: rec.title,
              Year: rec.year,
              Poster: rec.poster,
              Type: "movie"
            };

            return (
              <div key={rec.movieId} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[250px] relative">
                {/* Reason Badge */}
                <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>{getReasonIcon(rec.reason)}</span>
                  <span className="text-white truncate max-w-[120px]">{rec.reasonText}</span>
                </div>
                
                {/* Movie Card */}
                <MovieCard movie={movie} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mt-3">
        Based on your favorites and users with similar taste
      </p>
    </div>
  );
}

export default RecommendedMovies;
