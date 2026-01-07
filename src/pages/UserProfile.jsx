import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserProfile, followUser, unfollowUser, importPlaylist, getFollowers, getFollowing } from '../services/api';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ show: false, text: '', type: '' });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(username);
      setProfile(data.user);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile._id);
        setProfile({
          ...profile,
          isFollowing: false,
          followersCount: profile.followersCount - 1
        });
        showMessage('Unfollowed successfully', 'success');
      } else {
        await followUser(profile._id);
        setProfile({
          ...profile,
          isFollowing: true,
          followersCount: profile.followersCount + 1
        });
        showMessage('Following successfully', 'success');
      }
    } catch (err) {
      showMessage(err.message || 'Action failed', 'error');
    }
  };

  const handleImportPlaylist = async (playlistId) => {
    try {
      await importPlaylist(playlistId, profile._id);
      showMessage('Playlist imported successfully!', 'success');
    } catch (err) {
      showMessage(err.message || 'Failed to import playlist', 'error');
    }
  };

  // NEW FUNCTION - Handle playlist click
  const handlePlaylistClick = (playlist) => {
    if (profile.isOwnProfile) {
      // If it's your own profile, go to playlists page
      navigate('/playlists');
    } else {
      // If it's someone else's profile, show a message or do nothing
      showMessage('This is a public playlist from ' + profile.name, 'info');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ show: true, text, type });
    setTimeout(() => setMessage({ show: false, text: '', type: '' }), 3000);
  };

  const loadFollowers = async () => {
    try {
      const data = await getFollowers(profile._id);
      setFollowers(data.followers || []);
      setShowFollowersModal(true);
    } catch (err) {
      console.error('Failed to load followers:', err);
    }
  };

  const loadFollowing = async () => {
    try {
      const data = await getFollowing(profile._id);
      setFollowing(data.following || []);
      setShowFollowingModal(true);
    } catch (err) {
      console.error('Failed to load following:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-300 text-lg mb-6">{error || 'Profile not found'}</p>
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

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Message Toast */}
      {message.show && (
        <div className="fixed top-24 right-4 z-50 animate-slideIn">
          <div className={`px-6 py-3 rounded-lg shadow-2xl ${
            message.type === 'success' ? 'bg-green-500/90 text-white' : 
            message.type === 'info' ? 'bg-blue-500/90 text-white' :
            'bg-red-500/90 text-white'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      {/* Profile Header */}
      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-zinc-700/50 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-zinc-700 flex-shrink-0">
            {profile.profilePicture && profile.profilePicture !== 'https://via.placeholder.com/150' ? (
              <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center text-white text-4xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{profile.name}</h1>
            <p className="text-gray-400 text-lg mb-3">@{profile.username}</p>
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 justify-center md:justify-start mb-4">
              <button
                onClick={loadFollowers}
                className="text-center hover:text-red-500 transition-colors"
              >
                <div className="text-2xl font-bold text-white">{profile.followersCount}</div>
                <div className="text-gray-400 text-sm">Followers</div>
              </button>
              <button
                onClick={loadFollowing}
                className="text-center hover:text-red-500 transition-colors"
              >
                <div className="text-2xl font-bold text-white">{profile.followingCount}</div>
                <div className="text-gray-400 text-sm">Following</div>
              </button>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.playlists?.length || 0}</div>
                <div className="text-gray-400 text-sm">Playlists</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center md:justify-start">
              {/* Follow/Unfollow Button */}
              {!profile.isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    profile.isFollowing
                      ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                  }`}
                >
                  {profile.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}

              {/* Settings Button for Own Profile */}
              {profile.isOwnProfile && (
                <Link
                  to="/profile"
                  className="px-6 py-3 rounded-lg font-semibold transition-all bg-zinc-700 text-gray-300 hover:bg-zinc-600 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Profile Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Playlists Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          {profile.isOwnProfile ? 'Your' : `${profile.name}'s`} Public Playlists
        </h2>

        {profile.playlists.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-zinc-700/50">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-gray-400">No public playlists yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.playlists.map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => handlePlaylistClick(playlist)}
                className="bg-zinc-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-700/50 hover:border-red-600/50 transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer"
              >
                {/* Playlist Header */}
                <div className="p-4 border-b border-zinc-700">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                    {playlist.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-400">{playlist.movieCount || playlist.movies?.length || 0} movies</p>
                    {playlist.cloneCount > 0 && (
                      <p className="text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {playlist.cloneCount} imports
                      </p>
                    )}
                  </div>
                </div>

                {/* Import Button - Only show for other users' playlists */}
                {!profile.isOwnProfile && (
                  <div className="p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent playlist click when clicking import
                        handleImportPlaylist(playlist._id);
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Import Playlist
                    </button>
                  </div>
                )}

                {/* View Button - Only show for own playlists */}
                {profile.isOwnProfile && (
                  <div className="p-4">
                    <div className="text-center text-gray-400 text-sm">
                      Click to view in Playlists
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-zinc-700 shadow-2xl">
            <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Followers</h2>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {followers.length === 0 ? (
                <p className="text-center text-gray-400">No followers yet</p>
              ) : (
                <div className="space-y-3">
                  {followers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setShowFollowersModal(false);
                        navigate(`/user/${user.username}`);
                      }}
                      className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-zinc-700 shadow-2xl">
            <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Following</h2>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {following.length === 0 ? (
                <p className="text-center text-gray-400">Not following anyone yet</p>
              ) : (
                <div className="space-y-3">
                  {following.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setShowFollowingModal(false);
                        navigate(`/user/${user.username}`);
                      }}
                      className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default UserProfile;
