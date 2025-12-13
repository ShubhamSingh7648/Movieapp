import "./css/App.css";
import Favorites from "./pages/Favorites";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import React, { useState } from "react";
import { MovieProvider } from "./contexts/MovieContext";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <MovieProvider>
      <div className="min-h-screen bg-zinc-900">
        <NavBar onSearch={handleSearch} />
        <main className="main-content bg-zinc-900 min-h-screen">
          <Routes>
            <Route path="/" element={<Home searchQuery={searchQuery} />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </MovieProvider>
  );
}

export default App;