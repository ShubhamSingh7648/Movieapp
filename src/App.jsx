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
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NavBar onSearch={handleSearch} />
                <Home searchQuery={searchQuery} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <NavBar onSearch={handleSearch} />
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <NavBar onSearch={handleSearch} />
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <NavBar onSearch={handleSearch} />
                <Playlists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:imdbID"
            element={
              <ProtectedRoute>
                <NavBar onSearch={handleSearch} />
                <MovieDetails />
              </ProtectedRoute>
            }
          />
          {/* ADDED: Route for other user profiles */}
          <Route
            path="/user/:username"
            element={
              <ProtectedRoute>
                <NavBar onSearch={handleSearch} />
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;
