const User = require('../models/User');
const Follow = require('../models/Follow');

// @desc Follow a user
// @route POST /api/follow/:userId
// @access Private
exports.followUser = async (req, res) => {
  try {
    const userIdToFollow = req.params.userId;
    const currentUserId = req.user.id;

    // Check if trying to follow self
    if (userIdToFollow === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: currentUserId,
      followingId: userIdToFollow
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Create follow relationship
    await Follow.create({
      followerId: currentUserId,
      followingId: userIdToFollow
    });

    // Update both users
    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: userIdToFollow },
      $inc: { followingCount: 1 }
    });

    await User.findByIdAndUpdate(userIdToFollow, {
      $push: { followers: currentUserId },
      $inc: { followersCount: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc Unfollow a user
// @route DELETE /api/follow/:userId
// @access Private
exports.unfollowUser = async (req, res) => {
  try {
    const userIdToUnfollow = req.params.userId;
    const currentUserId = req.user.id;

    // Check if following
    const existingFollow = await Follow.findOne({
      followerId: currentUserId,
      followingId: userIdToUnfollow
    });

    if (!existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Remove follow relationship
    await Follow.deleteOne({
      followerId: currentUserId,
      followingId: userIdToUnfollow
    });

    // Update both users
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userIdToUnfollow },
      $inc: { followingCount: -1 }
    });

    await User.findByIdAndUpdate(userIdToUnfollow, {
      $pull: { followers: currentUserId },
      $inc: { followersCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc Get user's followers
// @route GET /api/follow/:userId/followers
// @access Private
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate('followers', 'username name profilePicture followersCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      followers: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc Get user's following
// @route GET /api/follow/:userId/following
// @access Private
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate('following', 'username name profilePicture followersCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      following: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc Get user profile by username
// @route GET /api/search/profile/:username
// @access Private
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    // Find user by username and populate playlists
    const user = await User.findOne({ username })
      .select('-password')
      .populate('playlists');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is following this user
    const isFollowing = await Follow.findOne({
      followerId: currentUserId,
      followingId: user._id
    });

    // Check if viewing own profile
    const isOwnProfile = user._id.toString() === currentUserId;

    // Filter playlists - show only public playlists unless it's own profile
    let playlists = user.playlists || [];
    if (!isOwnProfile) {
      playlists = playlists.filter(playlist => playlist.isPublic);
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: isOwnProfile ? user.email : undefined,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        playlists: playlists,
        isFollowing: !!isFollowing,
        isOwnProfile: isOwnProfile
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
