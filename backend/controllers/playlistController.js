const User = require('../models/User');

// @desc    Get all playlists for user
// @route   GET /api/users/playlists
// @access  Private
exports.getPlaylists = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      playlists: user.playlists || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new playlist
// @route   POST /api/users/playlists
// @access  Private
exports.createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Playlist name is required'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if playlist with same name exists
    const existingPlaylist = user.playlists.find(
      playlist => playlist.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingPlaylist) {
      return res.status(400).json({
        success: false,
        message: 'Playlist with this name already exists'
      });
    }

    user.playlists.push({
      name: name.trim(),
      movies: [],
      isPublic: false,
      cloneCount: 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      playlists: user.playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete playlist
// @route   DELETE /api/users/playlists/:playlistId
// @access  Private
exports.deletePlaylist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.playlists = user.playlists.filter(
      playlist => playlist._id.toString() !== req.params.playlistId
    );

    await user.save();

    res.status(200).json({
      success: true,
      playlists: user.playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add movie to playlist
// @route   POST /api/users/playlists/:playlistId/movies
// @access  Private
exports.addMovieToPlaylist = async (req, res) => {
  try {
    const { imdbID, Title, Year, Poster, Type } = req.body;
    const { playlistId } = req.params;

    const user = await User.findById(req.user.id);

    const playlist = user.playlists.id(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Check if movie already in playlist
    const movieExists = playlist.movies.find(
      movie => movie.imdbID === imdbID
    );

    if (movieExists) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in playlist'
      });
    }

    playlist.movies.push({
      imdbID,
      Title,
      Year,
      Poster,
      Type
    });

    await user.save();

    res.status(200).json({
      success: true,
      playlists: user.playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove movie from playlist
// @route   DELETE /api/users/playlists/:playlistId/movies/:imdbID
// @access  Private
exports.removeMovieFromPlaylist = async (req, res) => {
  try {
    const { playlistId, imdbID } = req.params;

    const user = await User.findById(req.user.id);

    const playlist = user.playlists.id(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    playlist.movies = playlist.movies.filter(
      movie => movie.imdbID !== imdbID
    );

    await user.save();

    res.status(200).json({
      success: true,
      playlists: user.playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle playlist privacy
// @route   PUT /api/users/playlists/:playlistId/privacy
// @access  Private
exports.togglePlaylistPrivacy = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const user = await User.findById(req.user.id);

    const playlist = user.playlists.id(playlistId);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    playlist.isPublic = !playlist.isPublic;
    await user.save();

    res.status(200).json({
      success: true,
      playlists: user.playlists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Import/Clone a playlist
// @route   POST /api/users/playlists/import/:playlistId
// @access  Private
exports.importPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    // Get the playlist owner
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Playlist owner not found'
      });
    }

    const originalPlaylist = owner.playlists.id(playlistId);
    if (!originalPlaylist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Check if playlist is public
    if (!originalPlaylist.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This playlist is private'
      });
    }

    // Get current user
    const currentUser = await User.findById(req.user.id);

    // Create cloned playlist name
    const clonedName = `${originalPlaylist.name} (from @${owner.username})`;

    // Check if already imported
    const alreadyImported = currentUser.playlists.find(
      p => p.clonedFromPlaylistId === playlistId
    );

    if (alreadyImported) {
      return res.status(400).json({
        success: false,
        message: 'You have already imported this playlist'
      });
    }

    // Clone the playlist
    currentUser.playlists.push({
      name: clonedName,
      movies: originalPlaylist.movies,
      isPublic: false,
      clonedFrom: ownerId,
      clonedFromPlaylistId: playlistId,
      cloneCount: 0
    });

    await currentUser.save();

    // Increment clone count on original
    originalPlaylist.cloneCount += 1;
    await owner.save();

    res.status(200).json({
      success: true,
      message: 'Playlist imported successfully',
      playlists: currentUser.playlists
    });
  } catch (error) {
    console.error('Import playlist error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};