import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; // ADDED
import { getUserProfile, followUser, unfollowUser, importPlaylist, getFollowers, getFollowing } from '../services/api';

function UserProfile() {
  const { username } = useParams();
  const { user } = useAuth(); // ADDED - get current logged-in user
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ show: false, text: '', type: '' });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // CHANGED: Use current user's username if no param provided
  const profileUsername = username || user?.username;

  useEffect(() => {
    if (profileUsername) {
      loadProfile();
    }
  }, [profileUsername]); // CHANGED from [username]

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(profileUsername); // CHANGED from username
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

  const handlePlaylistClick = (playlist) => {
    if (profile.isOwnProfile) {
      navigate('/playlists');
    } else {
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
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error || 'Profile not found'}</div>
        <button 
          onClick={() => navigate(-1)}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Message Toast */}
      {message.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg z-50 ${
          message.type === 'success' ? 'bg-green-600' : 
          message.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-6">
            <img
              src={profile.profilePicture || '/default-avatar.png'}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {!profile.isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2 rounded-lg font-semibold ${
                      profile.isFollowing
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {profile.isOwnProfile && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              <p className="text-gray-400 mb-4">@{profile.username}</p>
              {profile.bio && (
                <p className="text-gray-300 mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div 
                  className="cursor-pointer hover:text-red-500"
                  onClick={loadFollowers}
                >
                  <span className="font-bold">{profile.followersCount || 0}</span> Followers
                </div>
                <div 
                  className="cursor-pointer hover:text-red-500"
                  onClick={loadFollowing}
                >
                  <span className="font-bold">{profile.followingCount || 0}</span> Following
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playlists Section */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Public Playlists</h2>
          {!profile.playlists || profile.playlists.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No public playlists yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition"
                  onClick={() => handlePlaylistClick(playlist)}
                >
                  <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-gray-400 text-sm mb-3">{playlist.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{playlist.movieCount || playlist.movies?.length || 0} movies</span>
                    {playlist.cloneCount > 0 && (
                      <span className="text-red-500">{playlist.cloneCount} imports</span>
                    )}
                  </div>
                  {!profile.isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImportPlaylist(playlist._id);
                      }}
                      className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
                    >
                      Import Playlist
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Followers</h2>
              <button onClick={() => setShowFollowersModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            {followers.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No followers yet</p>
            ) : (
              <div className="space-y-3">
                {followers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg">
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <Link to={`/user/${user.username}`} onClick={() => setShowFollowersModal(false)}>
                        <p className="font-semibold hover:text-red-500">{user.name}</p>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Following</h2>
              <button onClick={() => setShowFollowingModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            {following.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Not following anyone yet</p>
            ) : (
              <div className="space-y-3">
                {following.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg">
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <Link to={`/user/${user.username}`} onClick={() => setShowFollowingModal(false)}>
                        <p className="font-semibold hover:text-red-500">{user.name}</p>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
