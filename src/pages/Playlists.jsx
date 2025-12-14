import React, { useState, useEffect } from 'react';
import { getPlaylists, createPlaylist, deletePlaylist } from '../services/api';
import MovieCard from '../components/MovieCard';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data.playlists || []);
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
      await loadPlaylists();
    } catch (err) {
      setError(err.message || 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await deletePlaylist(playlistId);
      await loadPlaylists();
    } catch (err) {
      setError(err.message || 'Failed to delete playlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-2">
            My Playlists
          </h1>
          <p className="text-gray-400 text-lg">
            Organize your favorite movies into custom playlists
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        >
          + Create Playlist
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
          {error}
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg border border-zinc-700/50 shadow-2xl">
            <div className="text-8xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-white mb-4">No Playlists Yet</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Create your first playlist to organize your favorite movies!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              Create Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50 hover:border-red-600/50 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer"
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{playlist.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist._id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400">
                {playlist.movies?.length || 0} {playlist.movies?.length === 1 ? 'movie' : 'movies'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-2xl p-8 max-w-md w-full border border-zinc-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Playlist</h2>
            <form onSubmit={handleCreatePlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-900/70 border border-zinc-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all outline-none mb-6"
                autoFocus
              />
              <div className="flex gap-3">
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
          <div className="bg-zinc-900 rounded-2xl p-8 max-w-6xl w-full border border-zinc-700 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">{selectedPlaylist.name}</h2>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedPlaylist.movies && selectedPlaylist.movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {selectedPlaylist.movies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No movies in this playlist yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Playlists;