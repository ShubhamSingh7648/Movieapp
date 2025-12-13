import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";

function NavBar({ onSearch }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const isActive = (path) => location.pathname === path;
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-8 py-5 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 tracking-wider hover:scale-105 transition-transform duration-300 whitespace-nowrap"
        >
          CINEMAN
        </Link>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Search for movies..."
              className="w-full px-6 py-3 pr-32 rounded-full bg-zinc-800/70 text-white placeholder-gray-400 border-2 border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-300"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              Search
            </button>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex gap-3">
          <Link
            to="/"
            className={`relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
              isActive("/")
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            Home
          </Link>
          
          <Link
            to="/favorites"
            className={`relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
              isActive("/favorites")
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;