const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users without username field
    const users = await User.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    });

    console.log(`📊 Found ${users.length} users to migrate\n`);

    let migratedCount = 0;

    for (const user of users) {
      try {
        // Generate username from email (part before @)
        const emailPrefix = user.email.split('@')[0];
        let baseUsername = emailPrefix
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove special chars
          .substring(0, 20); // Limit length

        // Ensure username is at least 3 chars
        if (baseUsername.length < 3) {
          baseUsername = `user${baseUsername}`;
        }

        // Check for duplicates and add number if needed
        let finalUsername = baseUsername;
        let counter = 1;
        
        while (await User.findOne({ username: finalUsername })) {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }

        // Update user with new fields
        user.username = finalUsername;
        user.bio = user.bio || '';
        user.isPrivate = user.isPrivate || false;
        user.followers = user.followers || [];
        user.following = user.following || [];
        user.followersCount = user.followersCount || 0;
        user.followingCount = user.followingCount || 0;

        // Update all playlists with new fields
        if (user.playlists && user.playlists.length > 0) {
          user.playlists = user.playlists.map(playlist => ({
            ...playlist.toObject(),
            isPublic: playlist.isPublic || false,
            cloneCount: playlist.cloneCount || 0,
            clonedFrom: playlist.clonedFrom || null
          }));
        }

        await user.save();
        migratedCount++;
        console.log(`✅ Migrated: ${user.email} → @${finalUsername}`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${user.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`   Migrated: ${migratedCount}/${users.length} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateUsers();
