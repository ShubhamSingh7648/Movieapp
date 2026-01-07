import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, searchMovie, followUser, unfollowUser } from '../services/api';

function SearchModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setUsers([]);
      setMovies([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'users') {
        const data = await searchUsers(searchQuery);
        setUsers(data.users || []);
      } else if (activeTab === 'movies') {
        const results = await searchMovie(searchQuery);
        setMovies(results || []);
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      
      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isFollowing: !isFollowing } : u
      ));
    } catch (err) {
      console.error('Follow/unfollow error:', err);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
    onClose();
  };

  const handleMovieClick = (imdbID) => {
    navigate(`/movie/${imdbID}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-zinc-700 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Search</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search for ${activeTab}...`}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white placeholder-gray-400 border border-zinc-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all outline-none"
            autoFocus
          />

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {['users', 'movies'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-400">Type at least 2 characters to search</p>
            </div>
          ) : activeTab === 'users' ? (
            users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👤</div>
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.profilePicture && user.profilePicture !== 'https://via.placeholder.com/150' ? (
                          <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{user.name}</h3>
                        <p className="text-gray-400 text-sm">@{user.username}</p>
                        {user.bio && (
                          <p className="text-gray-500 text-xs mt-1 truncate">{user.bio}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">{user.followersCount} followers</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollowToggle(user._id, user.isFollowing)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
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
            )
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-gray-400">No movies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {movies.map((movie) => (
                <div
                  key={movie.imdbID}
                  onClick={() => handleMovieClick(movie.imdbID)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-2">
                    <img
                      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                      alt={movie.Title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-red-500 transition-colors">
                    {movie.Title}
                  </h3>
                  <p className="text-gray-500 text-xs">{movie.Year}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;