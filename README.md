# 🎬 CINEMAN - Movie Discovery Platform

A full-stack movie search and management application built with the MERN stack, featuring user authentication, favorites management, and custom playlists.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### User Management
- ✅ Secure user registration and authentication
- ✅ JWT-based session management
- ✅ Profile picture upload with base64 encoding
- ✅ User profile management

### Movie Features
- ✅ Search 280,000+ movies and TV series via OMDB API
- ✅ View detailed movie information (cast, ratings, plot)
- ✅ Add movies to personal favorites
- ✅ Create and manage custom playlists
- ✅ Organize movies into multiple playlists

### UI/UX
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Dark mode theme with modern aesthetics
- ✅ Smooth animations and transitions
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ CORS protection
- ✅ Rate limiting on API endpoints
- ✅ NoSQL injection prevention
- ✅ Input validation and sanitization

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.0.0
- **Routing:** React Router DOM 7.5.0
- **Styling:** Tailwind CSS 4.1.4
- **Build Tool:** Vite 6.2.0
- **State Management:** Context API
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.2.1
- **Database:** MongoDB with Mongoose 9.0.1
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Hashing:** bcryptjs 3.0.3
- **Security:** helmet, express-rate-limit, express-mongo-sanitize

### External APIs
- **OMDB API:** Movie database and search

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 8.0.0 or higher (comes with Node.js)
- **MongoDB:** Local installation or MongoDB Atlas account
- **OMDB API Key:** Get one free at [omdbapi.com](http://www.omdbapi.com/apikey.aspx)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shubham7648/cineman.git
cd cineman
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/cineman
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cineman

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# CORS (Optional - for production)
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
# For production:
# VITE_API_URL=https://your-backend-domain.com

# OMDB API
VITE_OMDB_API_KEY=your_omdb_api_key_here
```

### Getting Your OMDB API Key

1. Visit [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. Select the FREE tier (1,000 requests/day)
3. Enter your email address
4. Check your email for the API key
5. Add it to your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Run from Root (requires concurrently package)

```bash
npm run dev
```

### Production Mode

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Run Backend:**
```bash
cd backend
npm start
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 📁 Project Structure

```
CINEMAN/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── userController.js        # User operations
│   │   └── playlistController.js    # Playlist operations
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   └── error.middleware.js      # Error handling
│   ├── models/
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   └── userRoutes.js            # User endpoints
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # Entry point
│
├── frontend/
│   ├── public/
│   │   └── C.svg                    # Logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── NavBar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   ├── authContext.jsx
│   │   │   └── MovieContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── Playlists.jsx
│   │   │   └── MovieDetails.jsx
│   │   ├── services/
│   │   │   └── api.js               # API communication
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Endpoints

#### Get Favorites
```http
GET /api/users/favorites
Authorization: Bearer <token>
```

#### Add to Favorites
```http
POST /api/users/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "imdbID": "tt1234567",
  "Title": "Movie Title",
  "Year": "2024",
  "Poster": "https://...",
  "Type": "movie"
}
```

#### Remove from Favorites
```http
DELETE /api/users/favorites/:imdbID
Authorization: Bearer <token>
```

### Playlist Endpoints

#### Get All Playlists
```http
GET /api/users/playlists
Authorization: Bearer <token>
```

#### Create Playlist
```http
POST /api/users/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Action Movies"
}
```

#### Delete Playlist
```http
DELETE /api/users/playlists/:playlistId
Authorization: Bearer <token>
```

#### Add Movie to Playlist
```http
POST /api/users/playlists/:playlistId/movies
Authorization: Bearer <token>
Content-Type: application/json

{
  "imdbID": "tt1234567",
  "Title": "Movie Title",
  "Year": "2024",
  "Poster": "https://...",
  "Type": "movie"
}
```

#### Remove Movie from Playlist
```http
DELETE /api/users/playlists/:playlistId/movies/:imdbID
Authorization: Bearer <token>
```

## 🚀 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Add environment variables in Render dashboard
5. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow prompts and add environment variables
5. Deploy

### Environment Variables for Production

**Backend (Render):**
```
PORT=5000
NODE_ENV=production
MONGO_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<strong_random_secret>
JWT_EXPIRE=7d
FRONTEND_URL=<your_vercel_url>
```

**Frontend (Vercel):**
```
VITE_API_URL=<your_render_backend_url>
VITE_OMDB_API_KEY=<your_omdb_api_key>
```

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Check your MongoDB connection string and ensure MongoDB is running

### Issue: "CORS error"
**Solution:** Add your frontend URL to the CORS whitelist in `server.js`

### Issue: "Movies not loading"
**Solution:** Verify your OMDB API key is correct and has not exceeded rate limits

### Issue: "Port already in use"
**Solution:** Change the PORT in `.env` or kill the process using that port

## 📝 Code Quality Guidelines

- Use ESLint for code linting
- Follow component-based architecture
- Write meaningful comments
- Use descriptive variable and function names
- Implement error handling for all async operations
- Keep components small and focused
- Use PropTypes for type checking

## 🔒 Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets in production
- Implement rate limiting on all endpoints
- Validate and sanitize all user inputs
- Use HTTPS in production
- Regularly update dependencies
- Implement proper error handling without exposing sensitive info

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - [GitHub](https://github.com/shubham7648)

## 🙏 Acknowledgments

- OMDB API for movie data
- MongoDB for database
- Tailwind CSS for styling
- React community for excellent tools and libraries

## 📞 Support

For support, email support@cineman.com or open an issue in the GitHub repository.

---

**Made with ❤️ and ☕**
