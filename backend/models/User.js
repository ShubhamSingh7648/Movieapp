const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  
  // ========== NEW FIELDS - ADD THESE ==========
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows null initially for existing users
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  // ========== END NEW FIELDS ==========
  
  favorites: [
    {
      imdbID: String,
      Title: String,
      Year: String,
      Poster: String,
      Type: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  playlists: [
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      movies: [
        {
          imdbID: String,
          Title: String,
          Year: String,
          Poster: String,
          Type: String,
          addedAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      // ========== NEW PLAYLIST FIELDS - ADD THESE ==========
      isPublic: {
        type: Boolean,
        default: false
      },
      clonedFrom: {
        playlistId: String, // Original playlist ID
        username: String,   // Original creator username
        userId: mongoose.Schema.Types.ObjectId
      },
      cloneCount: {
        type: Number,
        default: 0
      },
      // ========== END NEW PLAYLIST FIELDS ==========
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
