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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Search</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === 'users'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === 'movies'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Movies
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {!loading && !error && searchQuery.length < 2 && (
            <div className="text-center py-8 text-gray-400">
              Type at least 2 characters to search
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="search-results">
              {loading && <div className="text-center py-4 text-gray-400">Searching...</div>}

              {!loading && !error && users.length === 0 && searchQuery.length >= 2 && (
                <div className="text-center py-8 text-gray-400">No users found</div>
              )}

              {!loading && users.length > 0 && (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <img
                        src={user.profilePicture || '/default-avatar.png'}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-semibold">{user.name}</h3>
                        <p className="text-gray-400 text-sm">@{user.username}</p>
                        {user.bio && (
                          <p className="text-gray-500 text-sm truncate">{user.bio}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">{user.followersCount} followers</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowToggle(user._id, user.isFollowing);
                          }}
                          className={`mt-1 px-4 py-1 rounded-lg text-sm font-semibold ${
                            user.isFollowing
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MOVIES TAB - FIXED TO LIST FORMAT */}
          {activeTab === 'movies' && (
            <div className="search-results">
              {loading && <div className="text-center py-4 text-gray-400">Searching...</div>}

              {!loading && !error && movies.length === 0 && searchQuery.length >= 2 && (
                <div className="text-center py-8 text-gray-400">No movies found</div>
              )}

              {!loading && movies.length > 0 && (
                <div className="space-y-2">
                  {movies.map((movie) => (
                    <div
                      key={movie.imdbID}
                      onClick={() => handleMovieClick(movie.imdbID)}
                      className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition"
                    >
                      <img
                        src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.png'}
                        alt={movie.Title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium">{movie.Title}</h3>
                        <p className="text-gray-400 text-sm">{movie.Year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
