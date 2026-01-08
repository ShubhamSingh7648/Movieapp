import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import { getPlaylists, addMovieToPlaylist } from "../services/api";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const { isFavorite, addToFavorite, removeFromFavorite } = useMovieContext();
  const favorite = isFavorite(movie.imdbID);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: '', type: '' });
  const [imageError, setImageError] = useState(false);

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

  const handleCardClick = () => {
    navigate(`/movie/${movie.imdbID}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const hasPoster = movie.Poster && movie.Poster !== 'N/A' && !imageError;

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
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl bg-[#1a1a1a] group"
      onClick={handleCardClick}
    >
      {/* Poster Container */}
      <div className="relative w-full pb-[150%] bg-[#2a2a2a] overflow-hidden">
        {hasPoster ? (
          <img 
            src={movie.Poster} 
            alt={movie.Title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-4 md:p-5 text-center">
            <div className="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4 opacity-30">🎬</div>
            <div className="text-sm md:text-base lg:text-lg font-semibold text-gray-200 mb-2 line-clamp-3 px-2">
              {movie.Title}
            </div>
            <div className="text-xs md:text-sm text-gray-400">{movie.Year}</div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-start p-3 md:p-4">
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                favorite 
                  ? 'border-red-600 bg-red-600/30' 
                  : 'border-white/70 bg-black/70'
              }`}
              onClick={onFavoriteClick}
              title={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <span className="text-base md:text-lg">{favorite ? '❤️' : '🤍'}</span>
            </button>
            
            <button
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/70 bg-black/70 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black/90 hover:border-white text-base md:text-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistMenu(!showPlaylistMenu);
              }}
              title="Add to playlist"
            >
              ➕
            </button>
          </div>

          {/* Playlist Menu */}
          {showPlaylistMenu && (
            <div 
              className="playlist-menu-container absolute top-12 md:top-14 right-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#141414]/98 border border-gray-700 rounded-lg min-w-[180px] md:min-w-[200px] max-w-[220px] md:max-w-[250px] overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center px-3 md:px-4 py-2 md:py-3 bg-[#1a1a1a] border-b border-gray-700 font-semibold text-xs md:text-sm text-gray-200">
                  <span>Add to Playlist</span>
                  <button
                    className="text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-all w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-base md:text-lg"
                    onClick={() => setShowPlaylistMenu(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {loading ? (
                  <div className="p-4 md:p-5 text-center text-gray-400 text-xs md:text-sm">Loading...</div>
                ) : playlists.length === 0 ? (
                  <div className="p-4 md:p-5 text-center text-gray-400 text-xs md:text-sm">No playlists yet</div>
                ) : (
                  <div className="max-h-[180px] md:max-h-[200px] overflow-y-auto">
                    {playlists.map((playlist) => (
                      <button
                        key={playlist._id}
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-left text-gray-200 hover:bg-[#2a2a2a] transition-colors text-xs md:text-sm flex items-center gap-2"
                        onClick={(e) => handleAddToPlaylist(playlist._id, e)}
                      >
                        <span className="text-sm md:text-base">📋</span> {playlist.name}
                      </button>
                    ))}
                  </div>
                )}

                {message.show && (
                  <div className={`px-3 md:px-4 py-2 text-center text-xs md:text-sm font-semibold border-t border-gray-700 ${
                    message.type === 'success' 
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-red-900/20 text-red-400'
                  }`}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-2 md:p-3 bg-[#1a1a1a]">
        <h3 className="text-sm md:text-base font-semibold text-gray-200 mb-1 md:mb-1.5 line-clamp-2" title={movie.Title}>
          {movie.Title}
        </h3>
        <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm text-gray-400">
          <span>{movie.Year}</span>
          {movie.Type && (
            <>
              <span className="text-gray-600">•</span>
              <span className="capitalize">{movie.Type}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
