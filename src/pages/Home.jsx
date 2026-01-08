import RecommendedMovies from "../components/RecommendedMovies";
import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovie, getMovieDetails } from "../services/api";
import { useAuth } from "../contexts/authContext";
import React from "react";


function Home({ searchQuery }) {
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState({
    popular: [],
    action: [],
    comedy: [],
    drama: []
  });
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { isAuthenticated } = useAuth();


  // Load multiple categories on initial mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        
        const [popularRes, actionRes, comedyRes, dramaRes] = await Promise.all([
          searchMovie("Marvel"),
          searchMovie("Action"),
          searchMovie("Comedy"),
          searchMovie("Drama")
        ]);


        setCategories({
          popular: popularRes.slice(0, 10),
          action: actionRes.slice(0, 10),
          comedy: comedyRes.slice(0, 10),
          drama: dramaRes.slice(0, 10)
        });


        // ✨ RANDOM FEATURED MOVIE - Combines all categories and picks randomly
        const allMovies = [
          ...popularRes.slice(0, 10),
          ...actionRes.slice(0, 10),
          ...comedyRes.slice(0, 10),
          ...dramaRes.slice(0, 10)
        ];


        if (allMovies.length > 0) {
          // Pick a random movie
          const randomIndex = Math.floor(Math.random() * allMovies.length);
          const randomMovie = allMovies[randomIndex];
          
          // Get full details for the random movie
          const details = await getMovieDetails(randomMovie.imdbID);
          setFeaturedMovie(details);
        }


        setError(null);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };


    loadCategories();
  }, []); // Empty dependency array means this runs once on mount (each page load)


  // Handle search when searchQuery changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery && searchQuery.trim()) {
        setSearchLoading(true);
        try {
          const results = await searchMovie(searchQuery);
          setSearchResults(results);
          setError(null);
        } catch (err) {
          console.error("Search failed:", err);
          setError("Failed to search movies");
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };


    performSearch();
  }, [searchQuery]);


  const isSearching = searchQuery && searchQuery.trim();


  const SkeletonCard = () => (
    <div className="w-full rounded-lg overflow-hidden">
      <div className="w-full h-[300px] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse"></div>
      <div className="h-5 mt-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded"></div>
      <div className="h-4 mt-2 w-3/5 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded"></div>
    </div>
  );


  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white pb-10">
        <div className="h-[80vh] min-h-[500px] bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse mb-5"></div>
        <div className="px-[4%]">
          <div className="mb-10">
            <div className="h-8 w-64 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded mb-5"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (error && !isSearching) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-10">
          <div className="text-7xl mb-5">⚠️</div>
          <h2 className="text-3xl mb-3 text-gray-200">Oops! Something went wrong</h2>
          <p className="text-gray-400 text-lg mb-8">{error}</p>
          <button 
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-all duration-300 hover:scale-105"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#141414] text-white pb-10">
      {/* Hero Section */}
      {!isSearching && featuredMovie && (
        <div className="relative h-[80vh] min-h-[500px] flex items-center px-[4%] mb-5 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
            style={{
              backgroundImage: featuredMovie.Poster !== 'N/A' 
                ? `url(${featuredMovie.Poster})` 
                : 'none',
              filter: 'blur(3px) brightness(0.5)'
            }}
          ></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/80"></div>
          
          {/* Content */}
          <div className="relative z-10 max-w-2xl">
            <div className="inline-block bg-red-600/90 px-4 py-1.5 rounded text-sm font-semibold uppercase tracking-wider mb-5">
              Featured
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight drop-shadow-lg">
              {featuredMovie.Title}
            </h1>
            
            <div className="flex items-center gap-2 mb-5 text-base md:text-lg flex-wrap">
              <span>{featuredMovie.Year}</span>
              <span className="text-gray-500">•</span>
              <span className="text-yellow-400">⭐ {featuredMovie.imdbRating || 'N/A'}</span>
              <span className="text-gray-500">•</span>
              <span>{featuredMovie.Runtime || 'N/A'}</span>
            </div>
            
            <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed drop-shadow-md">
              {featuredMovie.Plot && featuredMovie.Plot !== 'N/A' 
                ? featuredMovie.Plot.slice(0, 200) + '...' 
                : 'No description available'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-semibold rounded-md hover:bg-white/80 transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = `/movie/${featuredMovie.imdbID}`}
              >
                <span>▶</span> Watch Now
              </button>
              <button 
                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gray-500/70 text-white font-semibold rounded-md hover:bg-gray-500/90 transition-all duration-300 hover:scale-105"
                onClick={() => window.location.href = `/movie/${featuredMovie.imdbID}`}
              >
                More Info
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Content Wrapper */}
      <div className="px-[4%]">
        {/* ✨ RECOMMENDED FOR YOU SECTION - ONLY SHOW WHEN NOT SEARCHING AND USER IS LOGGED IN */}
        {!isSearching && isAuthenticated && (
          <RecommendedMovies />
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-2">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-200">Search Results</h2>
              {!searchLoading && (
                <span className="text-sm md:text-base text-gray-400">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                </span>
              )}
            </div>


            {searchLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl md:text-7xl mb-5 opacity-50">🔍</div>
                <h3 className="text-xl md:text-2xl mb-3 text-gray-200">No results found</h3>
                <p className="text-base md:text-lg text-gray-400">Try searching for something else</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {searchResults.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))}
              </div>
            )}
          </div>
        )}


        {/* Category Sections */}
        {!isSearching && (
          <>
            {categories.popular.length > 0 && (
              <CategorySection title="Popular on Netflix" movies={categories.popular} />
            )}
            {categories.action.length > 0 && (
              <CategorySection title="Action & Adventure" movies={categories.action} />
            )}
            {categories.comedy.length > 0 && (
              <CategorySection title="Comedy Movies" movies={categories.comedy} />
            )}
            {categories.drama.length > 0 && (
              <CategorySection title="Drama & Thrillers" movies={categories.drama} />
            )}
          </>
        )}
      </div>
    </div>
  );
}


function CategorySection({ title, movies }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-200 mb-5">{title}</h2>
      <div className="relative">
        <div className="flex gap-3 md:gap-4 overflow-x-auto overflow-y-hidden pb-4" style={{ scrollBehavior: 'smooth' }}>
          {movies.map((movie) => (
            <div key={movie.imdbID} className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[250px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default Home;
