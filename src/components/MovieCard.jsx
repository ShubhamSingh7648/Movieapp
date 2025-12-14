import React, { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { getPlaylists, addMovieToPlaylist } from "../services/api";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorite, removeFromFavorite } = useMovieContext();
  const favorite = isFavorite(movie.imdbID);
  
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: '', type: '' });

  // Load playlists when menu opens
  useEffect(() => {
    if (showPlaylistMenu) {
      loadPlaylists();
    }
  }, [showPlaylistMenu]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    try {
      await addMovieToPlaylist(playlistId, {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Type: movie.Type
      });
      
      // Show success message
      setMessage({ show: true, text: 'Added!', type: 'success' });
      setTimeout(() => {
        setMessage({ show: false, text: '', type: '' });
        setShowPlaylistMenu(false);
      }, 1500);
    } catch (err) {
      setMessage({ show: true, text: err.message || 'Failed', type: 'error' });
      setTimeout(() => setMessage({ show: false, text: '', type: '' }), 2000);
    }
  };

  function onFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFromFavorite(movie.imdbID);
    else addToFavorite(movie);
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPlaylistMenu && !event.target.closest('.playlist-menu-container')) {
        setShowPlaylistMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlaylistMenu]);

  return (
    <div className="group relative bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-600/20 transition-all duration-300 hover:-translate-y-2 border border-zinc-700/50 hover:border-red-600/50">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        <img 
          src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster"} 
          alt={movie.Title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
        
        {/* Action Buttons Container */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-1.5 md:gap-2 z-10">
          {/* Favorite Button */}
          <button
            onClick={onFavoriteClick}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              favorite 
                ? "bg-red-600 text-white shadow-lg shadow-red-600/50" 
                : "bg-zinc-900/70 text-gray-400 hover:bg-zinc-800 hover:text-red-500"
            }`}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg 
              className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${favorite ? 'scale-110' : ''}`}
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

          {/* Add to Playlist Button */}
          <div className="relative playlist-menu-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistMenu(!showPlaylistMenu);
              }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-zinc-900/70 text-gray-400 hover:bg-zinc-800 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
              aria-label="Add to playlist"
            >
              <svg 
                className="w-4 h-4 md:w-5 md:h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </button>

            {/* Playlist Dropdown Menu */}
            {showPlaylistMenu && (
              <div className="absolute right-0 mt-2 w-48 md:w-56 bg-zinc-900 rounded-lg md:rounded-xl shadow-2xl border border-zinc-700 overflow-hidden z-50">
                <div className="p-2 md:p-3 border-b border-zinc-700">
                  <h3 className="text-xs md:text-sm font-semibold text-white">Add to Playlist</h3>
                </div>
                
                {message.show && (
                  <div className={`mx-2 md:mx-3 mt-2 md:mt-3 p-2 rounded-lg text-xs ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/50' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/50'
                  }`}>
                    {message.text}
                  </div>
                )}
                
                <div className="max-h-48 md:max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="p-3 md:p-4 text-center">
                      <p className="text-gray-400 text-xs md:text-sm mb-2">No playlists yet</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPlaylistMenu(false);
                          window.location.href = '/playlists';
                        }}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Create playlist
                      </button>
                    </div>
                  ) : (
                    <div className="py-1">
                      {playlists.map((playlist) => (
                        <button
                          key={playlist._id}
                          onClick={(e) => handleAddToPlaylist(playlist._id, e)}
                          className="w-full px-3 md:px-4 py-2 md:py-2.5 text-left text-xs md:text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate">{playlist.name}</span>
                          <span className="text-xs text-gray-500 group-hover:text-gray-400 ml-2">
                            {playlist.movies?.length || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Year Badge */}
        <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold text-gray-300 border border-zinc-700/50">
          {movie.Year}
        </div>
      </div>
      
      {/* Movie Info */}
      <div className="p-3 md:p-4">
        <h3 className="text-white font-bold text-xs md:text-sm line-clamp-2 mb-1 group-hover:text-red-500 transition-colors duration-300">
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