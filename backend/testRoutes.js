// backend/testRoutes.js
// This file helps verify all routes are working
// Run: node testRoutes.js

const express = require('express');

// Create a minimal test app
const app = express();

// Test middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Mock routes to verify path structure
const mockProtect = (req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
};

// Auth Routes - /api/auth
const authRouter = express.Router();
authRouter.post('/register', (req, res) => res.json({ route: 'register' }));
authRouter.post('/login', (req, res) => res.json({ route: 'login' }));
authRouter.get('/me', mockProtect, (req, res) => res.json({ route: 'getMe' }));
app.use('/api/auth', authRouter);

// Search Routes - /api/search
const searchRouter = express.Router();
searchRouter.use(mockProtect);
searchRouter.get('/users', (req, res) => {
  console.log('✅ Search users endpoint hit!');
  console.log('Query:', req.query);
  res.json({ 
    success: true, 
    users: [],
    message: 'Search endpoint working!'
  });
});
searchRouter.get('/profile/:username', (req, res) => {
  console.log('✅ Get profile endpoint hit!');
  res.json({ success: true, username: req.params.username });
});
app.use('/api/search', searchRouter);

// Follow Routes - /api/follow
const followRouter = express.Router();
followRouter.use(mockProtect);
followRouter.post('/:userId', (req, res) => {
  console.log('✅ Follow user endpoint hit!');
  res.json({ success: true, message: 'Followed' });
});
followRouter.delete('/:userId', (req, res) => {
  console.log('✅ Unfollow user endpoint hit!');
  res.json({ success: true, message: 'Unfollowed' });
});
followRouter.get('/:userId/followers', (req, res) => {
  console.log('✅ Get followers endpoint hit!');
  res.json({ success: true, followers: [] });
});
followRouter.get('/:userId/following', (req, res) => {
  console.log('✅ Get following endpoint hit!');
  res.json({ success: true, following: [] });
});
app.use('/api/follow', followRouter);

// User Routes - /api/users
const userRouter = express.Router();
userRouter.use(mockProtect);
userRouter.get('/favorites', (req, res) => res.json({ favorites: [] }));
userRouter.get('/playlists', (req, res) => res.json({ playlists: [] }));
app.use('/api/users', userRouter);

// Start server
const PORT = 5001; // Different port to avoid conflict
app.listen(PORT, () => {
  console.log('\n🧪 TEST SERVER RUNNING\n');
  console.log('Testing routes at http://localhost:' + PORT);
  console.log('\nTry these URLs in your browser or Postman:\n');
  console.log(`✅ GET  http://localhost:${PORT}/api/search/users?query=test`);
  console.log(`✅ GET  http://localhost:${PORT}/api/search/profile/testuser`);
  console.log(`✅ POST http://localhost:${PORT}/api/follow/123`);
  console.log(`✅ GET  http://localhost:${PORT}/api/follow/123/followers`);
  console.log('\nPress Ctrl+C to stop\n');
});