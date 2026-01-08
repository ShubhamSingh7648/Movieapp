// Calculate Jaccard Similarity between two users based on their favorites
// Formula: |A ∩ B| / |A ∪ B|
// Example: User A has [1,2,3,5], User B has [1,2,3,4]
// Intersection: [1,2,3] = 3 movies
// Union: [1,2,3,4,5] = 5 movies
// Similarity: 3/5 = 0.6 (60% similar)

exports.calculateJaccardSimilarity = (userAMovies, userBMovies) => {
  const setA = new Set(userAMovies);
  const setB = new Set(userBMovies);
  
  // Find intersection (common movies)
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  
  // Find union (all unique movies)
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
};

// Calculate weighted similarity using interaction weights
// Favorites = 3 points, Playlist = 2 points, View = 1 point
exports.calculateWeightedSimilarity = (userAInteractions, userBInteractions) => {
  const moviesA = {};
  const moviesB = {};
  
  // Build weighted movie maps
  userAInteractions.forEach(int => {
    moviesA[int.movieId] = (moviesA[int.movieId] || 0) + int.weight;
  });
  
  userBInteractions.forEach(int => {
    moviesB[int.movieId] = (moviesB[int.movieId] || 0) + int.weight;
  });
  
  // Get all unique movies
  const allMovies = new Set([
    ...Object.keys(moviesA),
    ...Object.keys(moviesB)
  ]);
  
  if (allMovies.size === 0) return 0;
  
  // Calculate weighted intersection
  let weightedIntersection = 0;
  let totalWeightA = 0;
  let totalWeightB = 0;
  
  allMovies.forEach(movieId => {
    const weightA = moviesA[movieId] || 0;
    const weightB = moviesB[movieId] || 0;
    
    if (weightA > 0 && weightB > 0) {
      weightedIntersection += Math.min(weightA, weightB);
    }
    
    totalWeightA += weightA;
    totalWeightB += weightB;
  });
  
  const maxTotal = Math.max(totalWeightA, totalWeightB);
  if (maxTotal === 0) return 0;
  
  return weightedIntersection / maxTotal;
};

// Calculate genre similarity score
exports.calculateGenreSimilarity = (genres1, genres2) => {
  if (!genres1 || !genres2 || genres1.length === 0 || genres2.length === 0) {
    return 0;
  }
  
  const set1 = new Set(genres1.map(g => g.toLowerCase()));
  const set2 = new Set(genres2.map(g => g.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};
