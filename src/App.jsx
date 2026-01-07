import "./css/App.css";
import Favorites from "./pages/Favorites";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import Playlists from "./pages/Playlists.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import React, { useState } from "react";
import { MovieProvider } from "./contexts/MovieContext.jsx";
import { AuthProvider } from "./contexts/authContext.jsx";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <AuthProvider>
      <MovieProvider>
        <div className="min-h-screen bg-zinc-900">
          <NavBar onSearch={handleSearch} />
          <main className="main-content bg-zinc-900 min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home searchQuery={searchQuery} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movie/:imdbID"
                element={
                  <ProtectedRoute>
                    <MovieDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playlists"
                element={
                  <ProtectedRoute>
                    <Playlists />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:username"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;