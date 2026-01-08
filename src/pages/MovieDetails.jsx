import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getPlaylists, addMovieToPlaylist, trackInteraction, getMovieTrailer } from '../services/api';
import { useMovieContext } from '../contexts/MovieContext';


function MovieDetails() {
  const { imdbID } = useParams();
  const navigate = useNavigate();
  const { isFavorite, addToFavorite, removeFromFavorite } = useMovieContext();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [message, setMessage] = useState({ show: false, text: '', type: '' });
  
  // ✨ Trailer state
  const [trailer, setTrailer] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);


  // ✨ Load movie details
  useEffect(() => {
    loadMovieDetails();
  }, [imdbID]);

  // ✨ Track movie view when page loads
  useEffect(() => {
    const trackView = async () => {
      if (imdbID && movie) {
        try {
          await trackInteraction(imdbID, 'view');
          console.log('✅ Tracked view for:', movie.Title);
        } catch (error) {
          // Silently fail - tracking is not critical
          console.error('❌ Failed to track view:', error);
        }
      }
    };
    
    // Only track after movie is loaded
    if (movie) {
      trackView();
    }
  }, [imdbID, movie]);

  // ✨ Load trailer when movie is loaded
  useEffect(() => {
    const loadTrailer = async () => {
      if (imdbID && movie) {
        try {
          setTrailerLoading(true);
          console.log('🎬 Loading trailer for:', movie.Title);
          const trailerData = await getMovieTrailer(imdbID);
          setTrailer(trailerData);
          if (trailerData) {
            console.log('✅ Trailer loaded:', trailerData.title);
          } else {
            console.log('ℹ️ No trailer available for this movie');
          }
        } catch (err) {
          console.error('❌ Failed to load trailer:', err);
        } finally {
          setTrailerLoading(false);
        }
      }
    };
    
    if (movie) {
      loadTrailer();
    }
  }, [imdbID, movie]);


  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const data = await getMovieDetails(imdbID);
      setMovie(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load movie details:', err);
      setError(err.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };


  const loadPlaylists = async () => {
    try {
      const data = await getPlaylists();
      setPlaylists(data.playlists || []);
    } catch (err) {
      console.error('Failed to load playlists:', err);
    }
  };


  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addMovieToPlaylist(playlistId, {
        imdbID: movie.imdbID,
        Title: movie.Title,
        Year: movie.Year,
        Poster: movie.Poster,
        Type: movie.Type
      });
      
      // ✨ Track playlist interaction
      try {
        await trackInteraction(movie.imdbID, 'playlist');
        console.log('✅ Tracked playlist interaction for:', movie.Title);
      } catch (err) {
        console.error('❌ Failed to track playlist interaction:', err);
      }
      
      setMessage({ show: true, text: 'Added to playlist!', type: 'success' });
      setTimeout(() => {
        setMessage({ show: false, text: '', type: '' });
        setShowPlaylistMenu(false);
      }, 1500);
    } catch (err) {
      setMessage({ show: true, text: err.message || 'Failed to add', type: 'error' });
      setTimeout(() => setMessage({ show: false, text: '', type: '' }), 2000);
    }
  };


  const handleFavoriteClick = () => {
    const movieData = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      Type: movie.Type
    };

    if (isFavorite(movie.imdbID)) {
      removeFromFavorite(movie.imdbID);
      setMessage({ show: true, text: 'Removed from favorites', type: 'success' });
    } else {
      addToFavorite(movieData);
      setMessage({ show: true, text: 'Added to favorites!', type: 'success' });
    }
    setTimeout(() => setMessage({ show: false, text: '', type: '' }), 2000);
  };


  const handlePlaylistClick = () => {
    setShowPlaylistMenu(!showPlaylistMenu);
    if (!showPlaylistMenu) {
      loadPlaylists();
    }
  };


  // ✨ Trailer Component
  const TrailerPlayer = ({ trailer }) => {
    if (!trailer) return null;
    
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎬</span> {trailer.title || 'Official Trailer'}
        </h3>
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer.videoId}?rel=0&modestbranding=1`}
              title={trailer.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading movie details...</p>
        </div>
      </div>
    );
  }


  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900 px-4">
        <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-300 text-lg mb-6">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  const favorite = isFavorite(movie.imdbID);


  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
      </div>


      {/* Message Toast */}
      {message.show && (
        <div className="fixed top-24 right-4 z-50 animate-slideIn">
          <div className={`px-6 py-3 rounded-lg shadow-2xl ${
            message.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {message.text}
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* LEFT SIDE - Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 group">
                <img 
                  src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/400x600?text=No+Poster"} 
                  alt={movie.Title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>


          {/* RIGHT SIDE - Movie Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                {movie.Title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm md:text-base mb-6">
                <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                  {movie.Year}
                </span>
                {movie.Rated !== "N/A" && (
                  <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                    {movie.Rated}
                  </span>
                )}
                {movie.Runtime !== "N/A" && (
                  <span className="px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                    {movie.Runtime}
                  </span>
                )}
              </div>


              {/* Genre Tags */}
              {movie.Genre !== "N/A" && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.Genre.split(', ').map((genre, idx) => (
                    <span 
                      key={idx} 
                      className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-600/50 rounded-full text-red-400 text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>


            {/* Ratings Section */}
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* IMDb Rating */}
                {movie.imdbRating !== "N/A" && (
                  <div className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500 text-2xl">⭐</span>
                      <span className="text-gray-400 text-sm">IMDb</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{movie.imdbRating}</div>
                    <div className="text-gray-500 text-xs mt-1">{movie.imdbVotes} votes</div>
                  </div>
                )}


                {/* Other Ratings */}
                {movie.Ratings && movie.Ratings.map((rating, idx) => (
                  <div key={idx} className="bg-zinc-900/70 rounded-xl p-4 border border-zinc-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {rating.Source.includes('Rotten') ? '🍅' : '📊'}
                      </span>
                      <span className="text-gray-400 text-sm">{rating.Source}</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{rating.Value}</div>
                  </div>
                ))}
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleFavoriteClick}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  favorite
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700'
                }`}
              >
                <svg className="w-6 h-6" fill={favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>


              <div className="flex-1 relative">
                <button
                  onClick={handlePlaylistClick}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Playlist
                </button>


                {/* Playlist Dropdown */}
                {showPlaylistMenu && (
                  <div className="absolute top-full mt-2 w-full bg-zinc-800 rounded-xl shadow-2xl border border-zinc-700 overflow-hidden z-50">
                    <div className="p-3 border-b border-zinc-700">
                      <h3 className="text-sm font-semibold text-white">Select Playlist</h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {playlists.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">No playlists yet</p>
                          <button
                            onClick={() => navigate('/playlists')}
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
                              onClick={() => handleAddToPlaylist(playlist._id)}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-between"
                            >
                              <span className="truncate">{playlist.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
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


            {/* ✨ TRAILER SECTION */}
            {trailerLoading ? (
              <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-gray-400 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
                    <span>Loading trailer...</span>
                  </div>
                </div>
              </div>
            ) : trailer ? (
              <TrailerPlayer trailer={trailer} />
            ) : null}


            {/* Plot */}
            {movie.Plot !== "N/A" && (
              <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📖</span> Plot
                </h3>
                <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                  {movie.Plot}
                </p>
              </div>
            )}


            {/* Director and Writer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movie.Director !== "N/A" && (
                <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span>🎬</span> Director
                  </h3>
                  <p className="text-gray-300 text-base">{movie.Director}</p>
                </div>
              )}


              {movie.Writer !== "N/A" && (
                <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span>✍️</span> Writer
                  </h3>
                  <p className="text-gray-300 text-base">{movie.Writer}</p>
                </div>
              )}
            </div>


            {/* Cast */}
            {movie.Actors !== "N/A" && (
              <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎭</span> Cast
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {movie.Actors.split(', ').map((actor, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-zinc-900/70 rounded-lg border border-zinc-700/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {actor.charAt(0)}
                      </div>
                      <span className="text-gray-300 font-medium">{actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Additional Info */}
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {movie.Language !== "N/A" && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Language</div>
                    <div className="text-gray-300 font-medium">{movie.Language}</div>
                  </div>
                )}


                {movie.Country !== "N/A" && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Country</div>
                    <div className="text-gray-300 font-medium">{movie.Country}</div>
                  </div>
                )}


                {movie.Released !== "N/A" && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Released</div>
                    <div className="text-gray-300 font-medium">{movie.Released}</div>
                  </div>
                )}


                {movie.BoxOffice !== "N/A" && (
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Box Office</div>
                    <div className="text-gray-300 font-medium">{movie.BoxOffice}</div>
                  </div>
                )}


                {movie.Awards !== "N/A" && (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 text-sm mb-1">Awards</div>
                    <div className="text-gray-300 font-medium">{movie.Awards}</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}


export default MovieDetails;
