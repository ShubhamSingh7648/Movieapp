// backend/scripts/addUsernames.js
// Run this ONCE to add usernames to existing users
// Usage: node scripts/addUsernames.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');

const addUsernamesToExistingUsers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users without username
    const usersWithoutUsername = await User.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });

    console.log(`Found ${usersWithoutUsername.length} users without username`);

    if (usersWithoutUsername.length === 0) {
      console.log('✅ All users already have usernames');
      process.exit(0);
    }

    // Update each user
    for (const user of usersWithoutUsername) {
      // Generate username from email
      let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      let username = baseUsername;
      let counter = 1;

      // Check if username exists and add numbers if needed
      while (await User.findOne({ username, _id: { $ne: user._id } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Update user
      user.username = username;
      await user.save();

      console.log(`✅ Updated user ${user.email} with username: ${username}`);
    }

    console.log('✅ All users updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

addUsernamesToExistingUsers();