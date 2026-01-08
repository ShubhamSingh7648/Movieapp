require('dotenv').config();
const { getMovieTrailer, getMovieByImdbId } = require('./services/tmdb');

async function testTMDB() {
  console.log('\n🧪 TMDB API Test Starting...\n');
  console.log('Configuration:');
  console.log('  API Key:', process.env.TMDB_API_KEY ? '✅ SET (' + process.env.TMDB_API_KEY.substring(0, 8) + '...)' : '❌ MISSING');
  console.log('  Base URL:', process.env.TMDB_BASE_URL || '❌ MISSING');
  console.log('\n' + '='.repeat(70) + '\n');
  
  const testMovies = [
    { imdb: 'tt1375666', name: 'Inception' },
    { imdb: 'tt0111161', name: 'Shawshank Redemption' },
    { imdb: 'tt0468569', name: 'The Dark Knight' },
    { imdb: 'tt0109830', name: 'Forrest Gump' },
    { imdb: 'tt13650480', name: 'Marvel Studios: Legends' }, // Your test movie
  ];
  
  for (const test of testMovies) {
    console.log(`🎬 Testing: ${test.name} (${test.imdb})`);
    
    try {
      // Step 1: Get movie from TMDB
      const movie = await getMovieByImdbId(test.imdb);
      
      if (!movie) {
        console.log(`   ❌ Movie NOT found in TMDB database`);
        console.log('');
        continue;
      }
      
      console.log(`   ✅ Movie found: ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`);
      console.log(`   📊 TMDB ID: ${movie.id}`);
      console.log(`   ⭐ Rating: ${movie.vote_average || 'N/A'}`);
      
      // Step 2: Get trailer
      const trailer = await getMovieTrailer(test.imdb);
      
      if (!trailer) {
        console.log(`   ❌ No trailer found (movie exists but no trailer in database)`);
      } else {
        console.log(`   ✅ Trailer found: "${trailer.title}"`);
        console.log(`   🎥 Video ID: ${trailer.videoId}`);
        console.log(`   🔗 Watch: https://www.youtube.com/watch?v=${trailer.videoId}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('='.repeat(70));
  console.log('✅ Test Complete!\n');
}

// Run test
testTMDB().catch((error) => {
  console.error('❌ Fatal Error:', error);
  process.exit(1);
});
