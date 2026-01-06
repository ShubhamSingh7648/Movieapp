const tmdbService = require('../services/tmdb');
require('dotenv').config();

const testTMDB = async () => {
  console.log('🎬 Testing TMDB API Integration...\n');

  try {
    // Test 1: Get movie by IMDB ID (The Dark Knight)
    console.log('Test 1: Fetching movie by IMDB ID (The Dark Knight - tt0468569)...');
    const movie = await tmdbService.getMovieByImdbId('tt0468569');
    if (movie) {
      console.log('✅ Movie Found:', movie.title);
      console.log('   Release Date:', movie.release_date);
      console.log('   Rating:', movie.vote_average);
    } else {
      console.log('❌ Movie not found');
    }

    // Test 2: Get trailer
    console.log('\nTest 2: Fetching movie trailer...');
    const trailer = await tmdbService.getMovieTrailer('tt0468569');
    if (trailer) {
      console.log('✅ Trailer Found:', trailer.title);
      console.log('   Video ID:', trailer.videoId);
      console.log('   YouTube URL:', trailer.youtubeUrl);
    } else {
      console.log('❌ No trailer found');
    }

    // Test 3: Search actors
    console.log('\nTest 3: Searching for "Tom Hanks"...');
    const actors = await tmdbService.searchActors('Tom Hanks');
    console.log('✅ Found', actors.length, 'actors');
    if (actors.length > 0) {
      console.log('   Top result:', actors[0].name);
      console.log('   TMDB ID:', actors[0].id);
    }

    // Test 4: Get actor details
    if (actors.length > 0) {
      console.log('\nTest 4: Fetching actor details...');
      const actorDetails = await tmdbService.getActorDetails(actors[0].id);
      if (actorDetails) {
        console.log('✅ Actor:', actorDetails.name);
        console.log('   Birthday:', actorDetails.birthday);
        console.log('   Known for:', actorDetails.known_for_department);
      }
    }

    // Test 5: Get movie credits (cast)
    console.log('\nTest 5: Fetching movie cast...');
    const credits = await tmdbService.getMovieCredits('tt0468569');
    if (credits && credits.cast) {
      console.log('✅ Found', credits.cast.length, 'cast members');
      console.log('   Main cast:');
      credits.cast.slice(0, 3).forEach(actor => {
        console.log(`   - ${actor.name} as ${actor.character}`);
      });
    }

    console.log('\n🎉 All tests completed successfully!\n');
    console.log('✅ Your TMDB API integration is working correctly.');
    console.log('✅ You can now proceed to Phase 2!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your TMDB_API_KEY in .env file');
    console.error('2. Internet connection');
    console.error('3. TMDB service is accessible\n');
  }
};

testTMDB();
