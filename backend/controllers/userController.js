const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc Get user favorites
// @route GET /api/users/favorites
// @access Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Add movie to favorites
// @route POST /api/users/favorites
// @access Private
exports.addFavorite = async (req, res) => {
  try {
    const { imdbID, Title, Year, Poster, Type } = req.body;
    const user = await User.findById(req.user.id);

    // Check if already favorited
    const alreadyFavorited = user.favorites.find(
      fav => fav.imdbID === imdbID
    );

    if (alreadyFavorited) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in favorites'
      });
    }

    user.favorites.push({
      imdbID,
      Title,
      Year,
      Poster,
      Type
    });

    await user.save();

    res.status(200).json({
      success: true,
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Remove movie from favorites
// @route DELETE /api/users/favorites/:imdbID
// @access Private
exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter(
      fav => fav.imdbID !== req.params.imdbID
    );

    await user.save();

    res.status(200).json({
      success: true,
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Update profile picture - UPDATED WITH CLOUDINARY
// @route PUT /api/users/profile-picture
// @access Private
exports.updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    // Get current user to delete old image if exists
    const currentUser = await User.findById(req.user.id);
    
    // Delete old image from Cloudinary if it exists
    if (currentUser.cloudinaryId) {
      await cloudinary.uploader.destroy(currentUser.cloudinaryId);
    }

    // Upload new image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
      folder: 'cineman/profile-pictures',
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      fetch_format: 'auto'
    });

    // Update user with new image URL and Cloudinary ID
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profilePicture: uploadResponse.secure_url,
        cloudinaryId: uploadResponse.public_id
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};
