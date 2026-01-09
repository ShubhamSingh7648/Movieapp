🎬 CINEMAN - Full-Stack Movie Discovery & Social Platform
Project Overview
CINEMAN is a sophisticated, full-stack movie discovery and social networking platform that combines powerful search capabilities, personalized recommendations, and social features to create an immersive cinematic experience. Built with modern web technologies, it delivers a Netflix-style interface with advanced user engagement features.

🎯 Key Features
1. Authentication & User Management

Secure JWT-based authentication system with bcrypt password hashing
User registration with auto-generated usernames or custom username selection
Profile customization with Cloudinary-powered image uploads
Session persistence with automatic token validation

2. Movie Discovery & Search

Dual Search System:

OMDB API integration for comprehensive movie database access
Real-time search with debouncing (500ms delay) for optimal performance
Search by movie title with instant results


Category Browsing: Pre-loaded collections (Popular, Action, Comedy, Drama)
Featured Hero Section: Dynamically randomized featured movie on each page load
Detailed Movie Pages:

Full movie information (plot, ratings, cast, crew, awards)
IMDB, Rotten Tomatoes, and Metacritic ratings display
Production details and box office information



3. Trailer Integration (TMDB API)

YouTube trailer embedding for movies
Automatic trailer detection and display
Graceful fallback for unavailable trailers
Smooth scroll-to-trailer functionality

4. Personalized Recommendations (AI-Powered)

Collaborative Filtering Algorithm:

Jaccard similarity calculation between users
Identifies users with similar taste (20%+ similarity threshold)
Weighted scoring system for recommendation ranking


Social Recommendations:

Suggests movies from followed users' favorites
Recency-based scoring with 30-day decay multiplier


Interaction Tracking:

Monitors user behavior (favorites, playlist additions, views)
Automatically marks recommendations as stale when user preferences change
Weighted interaction system (Favorites: 3pts, Playlists: 2pts, Views: 1pt)



5. Social Features

User Discovery:

Advanced user search with follow/unfollow capabilities
Real-time follow status updates
Followers & Following lists with modal displays


User Profiles:

Public profiles with customizable information
View other users' public playlists
Follower/Following counts
Profile badge system (public/private indicators)



6. Content Organization

Favorites System:

Heart-icon based favoriting
Persistent storage across sessions
Quick access to favorite movies


Custom Playlists:

Create unlimited custom playlists
Add/remove movies with drag-and-drop UI
Privacy controls (public/private toggle)
Playlist cloning/importing from other users
Clone count tracking for popular playlists
Visual playlist thumbnails (grid of movie posters)



7. Sharing Capabilities

Share Modal:

One-click URL copying
Direct movie page sharing
Success feedback with animations




🛠️ Technical Architecture
Frontend Stack

React 18.3 with Hooks (useState, useEffect, useContext, useRef)
React Router v6 for seamless SPA navigation
Tailwind CSS for responsive, utility-first styling
Context API for global state management:

AuthContext: User authentication state
MovieContext: Favorites and movie data management



Backend Stack

Node.js with Express.js 5.2 framework
MongoDB with Mongoose 9.0 ODM for data persistence
JWT (jsonwebtoken) for secure authentication
bcryptjs for password hashing
Cloudinary API for cloud-based image storage and CDN delivery
CORS enabled for cross-origin resource sharing

External APIs

OMDB API: Movie data, ratings, and metadata
TMDB API: Trailer videos and additional movie information

Database Schema Design
User Model:
