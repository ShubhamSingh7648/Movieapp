const User = require('../models/User');
const UserInteraction = require('../models/UserInteraction');
const MovieRecommendation = require('../models/MovieRecommendation');
const { calculateJaccardSimilarity, calculateWeightedSimilarity } = require('../utils/similarity');

class RecommendationEngine {
  
  // Main function to generate recommendations for a user
  async generateRecommendations(userId) {
    try {
      console.log(`🎬 Generating recommendations for user: ${userId}`);
      
      // Get user's interaction history
      const userInteractions = await UserInteraction.find({ userId });
      
      if (userInteractions.length === 0) {
        console.log('❌ No interactions found, returning empty recommendations');
        return [];
      }
      
      // Get user's favorite movie IDs
      const user = await User.findById(userId).populate('following');
      const userFavoriteIds = user.favorites.map(f => f.imdbID);
      
      if (userFavoriteIds.length === 0) {
        console.log('❌ No favorites found, returning empty recommendations');
        return [];
      }
      
      // Run all three recommendation algorithms in parallel
      const [collaborative, social] = await Promise.all([
        this.getCollaborativeRecommendations(userId, userFavoriteIds, userInteractions),
        this.getSocialRecommendations(userId, user.following)
      ]);
      
      // Combine and rank all recommendations
      const allRecommendations = [
        ...collaborative,
        ...social
      ];
      
      // Remove duplicates and sort by score
      const uniqueRecommendations = this.deduplicateAndRank(allRecommendations, userFavoriteIds);
      
      // Take top 20 recommendations
      const topRecommendations = uniqueRecommendations.slice(0, 20);
      
      console.log(`✅ Generated ${topRecommendations.length} recommendations`);
      
      return topRecommendations;
      
    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      throw error;
    }
  }
  
  // ALGORITHM 1: Collaborative Filtering
  // Find users with similar taste and recommend their favorites
  async getCollaborativeRecommendations(userId, userFavoriteIds, userInteractions) {
    try {
      console.log('🤝 Running collaborative filtering...');
      
      // Find all users who have at least 2 common favorites
      const usersWithCommonFavorites = await User.find({
        _id: { $ne: userId },
        'favorites.imdbID': { $in: userFavoriteIds }
      }).select('favorites');
      
      if (usersWithCommonFavorites.length === 0) {
        console.log('No similar users found');
        return [];
      }
      
      // Calculate similarity score for each user
      const similarUsers = [];
      
      for (const otherUser of usersWithCommonFavorites) {
        const otherUserFavoriteIds = otherUser.favorites.map(f => f.imdbID);
        
        // Calculate similarity
        const similarity = calculateJaccardSimilarity(userFavoriteIds, otherUserFavoriteIds);
        
        // Only consider users with at least 20% similarity
        if (similarity >= 0.2) {
          similarUsers.push({
            userId: otherUser._id,
            similarity,
            favorites: otherUser.favorites
          });
        }
      }
      
      // Sort by similarity (most similar first)
      similarUsers.sort((a, b) => b.similarity - a.similarity);
      
      // Take top 20 most similar users
      const topSimilarUsers = similarUsers.slice(0, 20);
      
      console.log(`Found ${topSimilarUsers.length} similar users`);
      
      // Collect movie recommendations from similar users
      const movieScores = {};
      
      topSimilarUsers.forEach(similarUser => {
        similarUser.favorites.forEach(movie => {
          const movieId = movie.imdbID;
          
          // Skip if user already has this movie
          if (userFavoriteIds.includes(movieId)) return;
          
          // Calculate score: similarity * weight
          const score = similarUser.similarity * 3; // Favorite weight
          
          if (!movieScores[movieId]) {
            movieScores[movieId] = {
              movieId,
              title: movie.Title,
              year: movie.Year,
              poster: movie.Poster,
              score: 0,
              reason: 'collaborative',
              reasonText: '👥 Users like you loved this'
            };
          }
          
          movieScores[movieId].score += score;
        });
      });
      
      // Convert to array and sort by score
      const recommendations = Object.values(movieScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 collaborative recommendations
      
      console.log(`✅ Generated ${recommendations.length} collaborative recommendations`);
      
      return recommendations;
      
    } catch (error) {
      console.error('Error in collaborative filtering:', error);
      return [];
    }
  }
  
  // ALGORITHM 2: Social Recommendations
  // Recommend movies that people you follow have favorited
  async getSocialRecommendations(userId, followingUsers) {
    try {
      console.log('👤 Running social recommendations...');
      
      if (!followingUsers || followingUsers.length === 0) {
        console.log('User is not following anyone');
        return [];
      }
      
      // Get current user's favorites
      const currentUser = await User.findById(userId);
      const userFavoriteIds = currentUser.favorites.map(f => f.imdbID);
      
      // Collect favorites from followed users
      const movieScores = {};
      
      for (const followedUser of followingUsers) {
        if (!followedUser.favorites || followedUser.favorites.length === 0) continue;
        
        followedUser.favorites.forEach(movie => {
          const movieId = movie.imdbID;
          
          // Skip if user already has this movie
          if (userFavoriteIds.includes(movieId)) return;
          
          // Calculate recency score (newer favorites weighted higher)
          const daysSinceAdded = (Date.now() - new Date(movie.addedAt)) / (1000 * 60 * 60 * 24);
          const recencyMultiplier = Math.max(1, 30 - daysSinceAdded) / 30; // Decay over 30 days
          
          const score = 2 * recencyMultiplier; // Base score * recency
          
          if (!movieScores[movieId]) {
            movieScores[movieId] = {
              movieId,
              title: movie.Title,
              year: movie.Year,
              poster: movie.Poster,
              score: 0,
              reason: 'social',
              reasonText: '🌟 Trending with people you follow'
            };
          }
          
          movieScores[movieId].score += score;
        });
      }
      
      // Convert to array and sort by score
      const recommendations = Object.values(movieScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Top 5 social recommendations
      
      console.log(`✅ Generated ${recommendations.length} social recommendations`);
      
      return recommendations;
      
    } catch (error) {
      console.error('Error in social recommendations:', error);
      return [];
    }
  }
  
  // Helper: Remove duplicates and rank final recommendations
  deduplicateAndRank(recommendations, userFavoriteIds) {
    const movieMap = {};
    
    recommendations.forEach(rec => {
      const movieId = rec.movieId;
      
      // Skip if user already has this movie
      if (userFavoriteIds.includes(movieId)) return;
      
      // If movie already exists, keep the one with higher score
      if (!movieMap[movieId] || movieMap[movieId].score < rec.score) {
        movieMap[movieId] = rec;
      }
    });
    
    // Convert to array and sort by score (highest first)
    return Object.values(movieMap).sort((a, b) => b.score - a.score);
  }
  
  // Save recommendations to database
  async saveRecommendations(userId, recommendations) {
    try {
      await MovieRecommendation.findOneAndUpdate(
        { userId },
        {
          userId,
          recommendations,
          lastUpdated: new Date(),
          isStale: false
        },
        { upsert: true, new: true }
      );
      
      console.log(`✅ Saved ${recommendations.length} recommendations for user ${userId}`);
      
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationEngine();
