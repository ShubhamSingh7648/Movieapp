import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import { searchUsers, searchMovie, followUser, unfollowUser } from '../services/api';

function NavBar({ onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("movies"); // movies or users
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  const performSearch = async () => {
    setLoading(true);
    setShowResults(true);
    try {
      if (searchType === 'users') {
        console.log('Searching users for:', searchQuery);
        const data = await searchUsers(searchQuery);
        console.log('User search results:', data);
        setSearchResults(data.users || []);
      } else {
        console.log('Searching movies for:', searchQuery);
        const results = await searchMovie(searchQuery);
        console.log('Movie search results:', results);
        setSearchResults(results || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchType === 'movies' && onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      setSearchResults(searchResults.map(u =>
        u._id === userId ? { ...u, isFollowing: !isFollowing } : u
      ));
    } catch (err) {
      console.error('Follow/unfollow error:', err);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleMovieClick = (imdbID) => {
    navigate(`/movie/${imdbID}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleLogout = () => {
    logout();
    setShowMobileMenu(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTypeDropdown && !event.target.closest('.search-type-dropdown')) {
        setShowTypeDropdown(false);
      }
      if (showResults && !event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTypeDropdown, showResults]);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowResults(false);
  }, [location.pathname]);

  return (
    <nav className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-4 md:px-8 py-4 md:py-5 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* Desktop & Mobile Header */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 tracking-wider hover:scale-105 transition-transform duration-300 whitespace-nowrap"
          >
            CINEMAN
          </Link>

          {/* Desktop Integrated Search Bar */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 max-w-2xl search-container relative">
              <div className="relative w-full">
                {/* Search Type Dropdown */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 search-type-dropdown">
                  <button
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-zinc-700/50 hover:bg-zinc-700 text-gray-300 text-sm font-medium transition-colors"
                  >
                    {searchType === 'movies' ? 'Movies' : 'Users'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showTypeDropdown && (
                    <div className="absolute top-full mt-1 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden min-w-[120px]">
                      <button
                        onClick={() => {
                          setSearchType('movies');
                          setShowTypeDropdown(false);
                          setSearchQuery("");
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          searchType === 'movies'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-zinc-700'
                        }`}
                      >
                        Movies
                      </button>
                      <button
                        onClick={() => {
                          setSearchType('users');
                          setShowTypeDropdown(false);
                          setSearchQuery("");
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          searchType === 'users'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-zinc-700'
                        }`}
                      >
                        Users
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder={`Search for ${searchType}...`}
                  className="w-full pl-32 pr-32 py-3 rounded-full bg-zinc-800/70 text-white placeholder-gray-400 border-2 border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-300"
                />

                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  Search
                </button>

                {/* Search Results Dropdown */}
                {showResults && (
                  <div className="absolute top-full mt-2 w-full bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700 overflow-hidden max-h-96 overflow-y-auto z-50">
                    {loading ? (
                      <div className="p-6 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-5xl mb-4">{searchType === 'users' ? '👤' : '🎬'}</div>
                        <p className="text-gray-400">No {searchType} found</p>
                        <p className="text-gray-500 text-sm mt-2">Try searching for something else</p>
                      </div>
                    ) : searchType === 'users' ? (
                      <div className="p-2">
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors"
                          >
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => handleUserClick(user.username)}
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user.profilePicture && user.profilePicture !== 'https://via.placeholder.com/150' ? (
                                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold text-sm truncate">{user.name}</h3>
                                <p className="text-gray-400 text-xs">@{user.username}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollowToggle(user._id, user.isFollowing);
                              }}
                              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                                user.isFollowing
                                  ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {user.isFollowing ? 'Following' : 'Follow'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-3 p-3">
                        {searchResults.slice(0, 8).map((movie) => (
                          <div
                            key={movie.imdbID}
                            onClick={() => handleMovieClick(movie.imdbID)}
                            className="cursor-pointer group"
                          >
                            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-1">
                              <img
                                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x225?text=No+Poster'}
                                alt={movie.Title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-white text-xs font-semibold line-clamp-2 group-hover:text-red-500 transition-colors">
                              {movie.Title}
                            </h3>
                            <p className="text-gray-500 text-xs">{movie.Year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                    isActive('/')
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/favorites"
                  className={`relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                    isActive('/favorites')
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  Favorites
                </Link>

                <Link
                  to="/playlists"
                  className={`relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                    isActive('/playlists')
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40'
                      : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  Playlists
                </Link>

                {/* Desktop Profile Button - UPDATED */}
                <button
                  onClick={() => navigate(`/user/${user?.username}`)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold">
                    {user?.profilePicture && user.profilePicture !== 'https://via.placeholder.com/150' ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = user?.name?.charAt(0).toUpperCase() || 'U';
                        }}
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">{user?.name}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-full bg-zinc-800 text-gray-300 hover:text-white transition-colors"
              >
                {showMobileMenu ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Mobile Auth Buttons */}
          {!isAuthenticated && (
            <div className="flex lg:hidden gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full font-semibold text-sm bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && showMobileMenu && (
          <div className="lg:hidden mt-4 bg-zinc-800/95 rounded-2xl border border-zinc-700 overflow-hidden animate-fadeIn">
            {/* Mobile Profile Header */}
            <div className="p-4 border-b border-zinc-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold">
                {user?.profilePicture && user.profilePicture !== 'https://via.placeholder.com/150' ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>

            {/* Mobile Menu Links */}
            <div className="py-2">
              <Link
                to="/"
                className={`block px-4 py-3 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors ${
                  isActive('/') ? 'bg-zinc-700 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </div>
              </Link>

              <Link
                to="/favorites"
                className={`block px-4 py-3 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors ${
                  isActive('/favorites') ? 'bg-zinc-700 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Favorites
                </div>
              </Link>

              <Link
                to="/playlists"
                className={`block px-4 py-3 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors ${
                  isActive('/playlists') ? 'bg-zinc-700 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Playlists
                </div>
              </Link>

              {/* Mobile My Profile Link - UPDATED */}
              <Link
                to={`/user/${user?.username}`}
                className="block px-4 py-3 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </div>
              </Link>

              {/* Mobile Settings Link */}
              <Link
                to="/profile"
                className={`block px-4 py-3 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors ${
                  isActive('/profile') ? 'bg-zinc-700 text-white' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default NavBar;
