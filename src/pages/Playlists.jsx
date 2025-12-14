import React, { useState, useEffect } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist, removeMovieFromPlaylist } from '../services/api';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data.playlists || []);
      setError('');
    } catch (err) {
      console.error('Failed to load playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateModal(false);
      setSuccessMessage('Playlist created!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadPlaylists();
    } catch (err) {
      setError(err.message || 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Delete this playlist?')) return;

    try {
      await deletePlaylist(playlistId);
      setSuccessMessage('Playlist deleted!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadPlaylists();
      if (selectedPlaylist?._id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete playlist');
    }
  };

  const handleRemoveMovie = async (playlistId, imdbID) => {
    if (!window.confirm('Remove this movie?')) return;

    try {
      await removeMovieFromPlaylist(playlistId, imdbID);
      setSuccessMessage('Movie removed!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadPlaylists();
      
      if (selectedPlaylist?._id === playlistId) {
        const updatedPlaylists = await getPlaylists();
        const updatedPlaylist = updatedPlaylists.playlists.find(p => p._id === playlistId);
        setSelectedPlaylist(updatedPlaylist);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove movie');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-base md:text-lg">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-2">
            My Playlists
          </h1>
          <p className="text-gray-400 text-sm md:text-lg">
            Organize your favorite movies
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Playlist
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 flex items-center justify-between text-sm md:text-base">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-300 hover:text-red-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-3 md:p-4 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 flex items-center justify-between text-sm md:text-base">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-300 hover:text-green-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl md:rounded-3xl p-8 md:p-12 max-w-lg w-full border border-zinc-700/50 shadow-2xl">
            <div className="text-6xl md:text-8xl mb-4 md:mb-6">📝</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">No Playlists Yet</h2>
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
              Create your first playlist to organize your favorite movies!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto px-6 md:px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              Create Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-zinc-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden border border-zinc-700/50 hover:border-red-600/50 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer group"
              onClick={() => setSelectedPlaylist(playlist)}
            >
              {/* Playlist Thumbnail */}
              <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                {playlist.movies && playlist.movies.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 h-full p-1">
                    {playlist.movies.slice(0, 4).map((movie, idx) => (
                      <div key={idx} className="relative overflow-hidden rounded">
                        <img
                          src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150x200?text=No+Poster"}
                          alt={movie.Title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {playlist.movies.length < 4 && [...Array(4 - playlist.movies.length)].map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-zinc-800 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600">
                    <svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
              </div>

              {/* Playlist Info */}
              <div className="p-3 md:p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base md:text-lg font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 flex-1">
                    {playlist.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist._id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">
                  {playlist.movies?.length || 0} {playlist.movies?.length === 1 ? 'movie' : 'movies'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full border border-zinc-700 shadow-2xl">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Create New Playlist</h2>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all outline-none mb-4 md:mb-6"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                  }}
                  className="flex-1 px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Detail Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 max-w-6xl w-full border border-zinc-700 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{selectedPlaylist.name}</h2>
                <p className="text-gray-400 text-sm md:text-base">
                  {selectedPlaylist.movies?.length || 0} {selectedPlaylist.movies?.length === 1 ? 'movie' : 'movies'}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedPlaylist.movies && selectedPlaylist.movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                {selectedPlaylist.movies.map((movie) => (
                  <div key={movie.imdbID} className="group relative bg-zinc-800/50 rounded-xl md:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-zinc-700/50">
                    <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
                      <img 
                        src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Poster"} 
                        alt={movie.Title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      <button
                        onClick={() => handleRemoveMovie(selectedPlaylist._id, movie.imdbID)}
                        className="absolute top-2 md:top-3 right-2 md:right-3 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-red-600/80 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="absolute top-2 md:top-3 left-2 md:left-3 bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-semibold text-gray-300 border border-zinc-700/50">
                        {movie.Year}
                      </div>
                    </div>
                    
                    <div className="p-3 md:p-4">
                      <h3 className="text-white font-bold text-xs md:text-sm line-clamp-2 mb-1">
                        {movie.Title}
                      </h3>
                      {movie.Type && (
                        <p className="text-gray-500 text-xs uppercase tracking-wider">
                          {movie.Type}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl md:text-6xl mb-4">🎬</div>
                <p className="text-gray-400 text-base md:text-lg mb-4">No movies in this playlist yet</p>
                <p className="text-gray-500 text-xs md:text-sm">Add movies by clicking the + button on any movie card</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlists;