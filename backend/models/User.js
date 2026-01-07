const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
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
  bio: {
    type: String,
    maxlength: [200, 'Bio must be less than 200 characters'],
    default: ''
  },
  profilePicture: {
    type: String,
    default: 'https://via.placeholder.com/150'
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
      isPublic: {
        type: Boolean,
        default: false
      },
      clonedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      clonedFromPlaylistId: {
        type: String,
        default: null
      },
      cloneCount: {
        type: Number,
        default: 0
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