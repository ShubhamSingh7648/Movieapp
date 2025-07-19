import { Link } from "react-router-dom";
import React from "react";

function NavBar() {
  return (
    <nav className="bg-gradient-to-r from-zinc-800 to-zinc-700 px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="text-2xl font-bold text-white tracking-wide">
        <Link to="/" className="hover:text-gray-300 transition-colors">
          Movie App
        </Link>
      </div>
      <div className="flex gap-6">
        <Link
          to="/"
          className="text-white text-base px-3 py-2 rounded-md hover:bg-zinc-600 hover:underline hover:font-semibold transition-all"
        >
          Home
        </Link>
        <Link
          to="/favorites"
          className="text-white text-base px-3 py-2 rounded-md hover:bg-zinc-600 hover:underline hover:font-semibold transition-all"
        >
          Favorites
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
