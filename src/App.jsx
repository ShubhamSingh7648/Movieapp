import "./css/App.css";
import Favorites from "./pages/Favorites";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Playlists from "./pages/Playlists";
import MovieDetails from "./pages/MovieDetails";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import React, { useState } from "react";
import { MovieProvider } from "./contexts/MovieContext";
import { AuthProvider } from "./contexts/authContext";

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