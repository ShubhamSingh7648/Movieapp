import React, { useState, useEffect, useRef } from 'react';
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
  const [trailer, setTrailer] = useState(null);
  const [trailerLoading, setTrailerLoading] = useState(false);

  // Ref for smooth scrolling to trailer
  const trailerRef = useRef(null);

  useEffect(() => {
    loadMovieDetails();
  }, [imdbID]);

  useEffect(() => {
    const trackView = async () => {
      if (imdbID && movie) {
        try {
          await trackInteraction(imdbID, 'view');
        } catch (error) {
          console.error('Failed to track view:', error);
        }
      }
    };
    if (movie) trackView();
  }, [imdbID, movie]);

  useEffect(() => {
    const loadTrailer = async () => {
      if (imdbID && movie) {
        try {
          setTrailerLoading(true);
          const trailerData = await getMovieTrailer(imdbID);
          setTrailer(trailerData);
        } catch (err) {
          console.error('Failed to load trailer:', err);
        } finally {
          setTrailerLoading(false);
        }
      }
    };
    if (movie) loadTrailer();
  }, [imdbID, movie]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      const data = await getMovieDetails(imdbID);
      setMovie(data);
      setError(null);
    } catch (err) {
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
      
      await trackInteraction(movie.imdbID, 'playlist').catch(() => {});
      
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
    if (!showPlaylistMenu) loadPlaylists();
  };

  // Smooth scroll to trailer
  const handlePlayTrailer = () => {
    if (trailer && trailerRef.current) {
      trailerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-700 text-lg mb-6">{error || 'Movie not found'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(movie.imdbID);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Message Toast */}
      {message.show && (
        <div className="fixed top-24 right-4 z-50 animate-slideIn">
          <div className={`px-6 py-3 rounded-lg shadow-2xl ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Hero Section with BUTTONS INSIDE */}
      <div className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[70vh] overflow-hidden bg-gradient-to-b from-black to-gray-900">
        
        {/* Backdrop with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: movie.Poster !== 'N/A' ? `url(${movie.Poster})` : 'none',
            filter: 'blur(40px)',
            transform: 'scale(1.2)'
          }}
        />
        
        {/* Content - With Buttons */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            
            {/* Poster */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-[200px] sm:w-[220px] md:w-[240px] lg:w-[280px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/280x420?text=No+Poster"} 
                  alt={movie.Title}
                  className="w-full"
                />
              </div>
            </div>

            {/* Movie Info WITH BUTTONS */}
            <div className="flex-1 text-white text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 drop-shadow-2xl leading-tight">
                {movie.Title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-3 text-sm md:text-base">
                {movie.Runtime && movie.Runtime !== "N/A" && (
                  <span className="bg-white/10 px-3 py-1 rounded-full">{movie.Runtime}</span>
                )}
                <span className="hidden md:inline">•</span>
                {movie.Year && (
                  <span className="bg-white/10 px-3 py-1 rounded-full">{movie.Year}</span>
                )}
                {movie.imdbRating && movie.imdbRating !== "N/A" && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-md font-bold">
                      <span className="text-xs">IMDB</span>
                      <span className="text-sm md:text-base">{movie.imdbRating}</span>
                    </div>
                  </>
                )}
              </div>

              {movie.Genre && movie.Genre !== "N/A" && (
                <div className="text-sm md:text-base mb-4 text-gray-300">
                  {movie.Genre.split(', ').join(' • ')}
                </div>
              )}

              {/* LIMITED Plot Description - Max 3 lines */}
              {movie.Plot && movie.Plot !== "N/A" && (
                <p className="text-xs md:text-sm lg:text-base text-gray-300 leading-relaxed max-w-3xl mb-6 line-clamp-3">
                  {movie.Plot}
                </p>
              )}

              {/* ACTION BUTTONS - INSIDE HERO! */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button 
                  className="px-6 md:px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePlayTrailer}
                  disabled={!trailer}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                  <span className="text-sm md:text-base">Play Trailer</span>
                </button>
                
                <button
                  onClick={handleFavoriteClick}
                  className={`px-6 md:px-8 py-3 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base ${
                    favorite
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>

                <div className="relative">
                  <button
                    onClick={handlePlaylistClick}
                    className="w-full px-6 md:px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                  >
                    Add to Playlist
                  </button>

                  {showPlaylistMenu && (
                    <div className="absolute top-full mt-2 w-full sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-800">Select Playlist</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {playlists.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-gray-500 text-sm mb-2">No playlists yet</p>
                            <button onClick={() => navigate('/playlists')} className="text-xs text-red-600 hover:text-red-700 font-medium">
                              Create playlist
                            </button>
                          </div>
                        ) : (
                          <div>
                            {playlists.map((playlist) => (
                              <button
                                key={playlist._id}
                                onClick={() => handleAddToPlaylist(playlist._id)}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {playlist.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* 🎬 TRAILER SECTION - WITH REF FOR SCROLLING */}
        <div ref={trailerRef}>
          {trailerLoading ? (
            <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mb-8 border-4 border-gray-300 shadow-2xl">
              <div className="text-white flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
                <span className="text-lg font-semibold">Loading trailer...</span>
              </div>
            </div>
          ) : trailer ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">🎬</span>
                  Official Trailer
                </h2>
                <div className="flex items-center gap-2 bg-red-600 text-white text-xs px-2 py-1 rounded-lg font-bold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-300 bg-black group hover:border-red-500 transition-colors duration-300">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${trailer.videoId}?rel=0&modestbranding=1`}
                    title={trailer.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
              <p className="text-center text-gray-600 mt-2 text-sm font-medium">{trailer.title}</p>
            </div>
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-8 border-4 border-dashed border-gray-400">
              <div className="text-center">
                <span className="text-5xl mb-3 block">🎥</span>
                <span className="text-gray-600 font-semibold text-sm">No trailer available</span>
              </div>
            </div>
          )}
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {movie.imdbRating && movie.imdbRating !== "N/A" && (
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-base md:text-lg font-black">IMDb</span>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-gray-900">{movie.imdbRating}<span className="text-lg text-gray-400">/10</span></div>
                  {movie.imdbVotes && movie.imdbVotes !== "N/A" && (
                    <div className="text-xs text-gray-500">({movie.imdbVotes} votes)</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {movie.Ratings && movie.Ratings.length > 0 && movie.Ratings.slice(0, 2).map((rating, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  rating.Source.includes('Rotten') ? 'bg-red-500' : 'bg-gray-700'
                }`}>
                  <span className="text-2xl">{rating.Source.includes('Rotten') ? '🍅' : '▲'}</span>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-gray-900">
                    {rating.Value.includes('%') ? rating.Value.replace('%', '') : rating.Value}
                    {rating.Value.includes('%') && <span className="text-lg text-gray-400">%</span>}
                  </div>
                  <div className="text-xs text-gray-500">{rating.Source.includes('Rotten') ? '(Critics)' : '(Metascore)'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Plot Synopsis */}
        {movie.Plot && movie.Plot !== "N/A" && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3">Plot Synopsis</h2>
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-gray-200">
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                {movie.Plot}
              </p>
            </div>
          </div>
        )}

        {/* Cast - Compact Grid */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Cast & Crew</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            
            {movie.Director && movie.Director !== "N/A" && (
              <div className="text-center bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {movie.Director.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900 mb-1">Director</div>
                <div className="text-xs text-gray-600 truncate">{movie.Director.split(',')[0]}</div>
              </div>
            )}

            {movie.Writer && movie.Writer !== "N/A" && (
              <div className="text-center bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {movie.Writer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900 mb-1">Writer</div>
                <div className="text-xs text-gray-600 truncate">{movie.Writer.split(',')[0]}</div>
              </div>
            )}

            {movie.Production && movie.Production !== "N/A" && (
              <div className="text-center bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {movie.Production.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900 mb-1">Studio</div>
                <div className="text-xs text-gray-600 truncate">{movie.Production}</div>
              </div>
            )}

            {movie.Actors && movie.Actors !== "N/A" && movie.Actors.split(',').slice(0, 3).map((actor, idx) => (
              <div key={idx} className="text-center bg-white rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {actor.trim().split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900 mb-1">Actor</div>
                <div className="text-xs text-gray-600 truncate">{actor.trim()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        {((movie.Language && movie.Language !== "N/A") || 
          (movie.Country && movie.Country !== "N/A") || 
          (movie.Released && movie.Released !== "N/A") || 
          (movie.BoxOffice && movie.BoxOffice !== "N/A") || 
          (movie.Awards && movie.Awards !== "N/A")) && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Additional Information</h2>
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {movie.Language && movie.Language !== "N/A" && (
                  <div className="border-b pb-2 sm:border-b-0 sm:pb-0">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Language</div>
                    <div className="text-sm text-gray-900 font-medium">{movie.Language}</div>
                  </div>
                )}
                {movie.Country && movie.Country !== "N/A" && (
                  <div className="border-b pb-2 sm:border-b-0 sm:pb-0">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Country</div>
                    <div className="text-sm text-gray-900 font-medium">{movie.Country}</div>
                  </div>
                )}
                {movie.Released && movie.Released !== "N/A" && (
                  <div className="border-b pb-2 sm:border-b-0 sm:pb-0">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Released</div>
                    <div className="text-sm text-gray-900 font-medium">{movie.Released}</div>
                  </div>
                )}
                {movie.BoxOffice && movie.BoxOffice !== "N/A" && (
                  <div className="border-b pb-2 sm:border-b-0 sm:pb-0">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Box Office</div>
                    <div className="text-sm text-gray-900 font-medium">{movie.BoxOffice}</div>
                  </div>
                )}
                {movie.Awards && movie.Awards !== "N/A" && (
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500 mb-1 font-semibold">Awards</div>
                    <div className="text-sm text-gray-900 font-medium">{movie.Awards}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MovieDetails;
