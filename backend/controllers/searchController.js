const User = require('../models/User');

// @desc    Search for users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search by username or name, case-insensitive
    const users = await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      isPrivate: false, // Only show public accounts
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username name profilePicture followersCount bio')
    .limit(20);

    // Check which users the current user is following
    const currentUser = await User.findById(currentUserId).select('following');
    const followingIds = currentUser.following.map(id => id.toString());

    const usersWithFollowStatus = users.map(user => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      followersCount: user.followersCount,
      bio: user.bio,
      isFollowing: followingIds.includes(user._id.toString())
    }));

    res.status(200).json({
      success: true,
      users: usersWithFollowStatus
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findOne({ username })
      .select('-password -favorites')
      .populate('followers', 'username name profilePicture')
      .populate('following', 'username name profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is following this user
    const currentUser = await User.findById(currentUserId).select('following');
    const isFollowing = currentUser.following.some(
      id => id.toString() === user._id.toString()
    );

    // Filter playlists based on privacy settings
    let playlists = user.playlists;
    
    if (user.isPrivate && !isFollowing && user._id.toString() !== currentUserId) {
      // Private account and not following - show no playlists
      playlists = [];
    } else if (!user.isPrivate || isFollowing || user._id.toString() === currentUserId) {
      // Public account OR following OR own profile - show public playlists
      playlists = user.playlists.filter(playlist => 
        playlist.isPublic || user._id.toString() === currentUserId
      );
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        isPrivate: user.isPrivate,
        isFollowing,
        isOwnProfile: user._id.toString() === currentUserId,
        playlists: playlists.map(p => ({
          _id: p._id,
          name: p.name,
          isPublic: p.isPublic,
          cloneCount: p.cloneCount,
          movieCount: p.movies.length,
          createdAt: p.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};