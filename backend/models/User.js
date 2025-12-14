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