/*
import axios from "axios";
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const Navbar = ({ loggedIn, setLoggedIn }) => {

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/logOut', {}, { withCredentials: true });

      setLoggedIn(false);
      alert(response.data.message);

    } catch (err) {
      if (err.response?.data) {
        console.log(err);
        alert(err.response.data.err);
      } else {
        alert("Something went wrong");
      }
    }
  };

  return (
    <>
      <nav className="bg-white fixed top-0 left-0 right-0 shadow-md w-full py-3 z-10">

        <div className="flex justify-between items-center px-4 sm:px-8">

          // Logo 
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
            Developer Collaboration Tool
          </h1>

          // Hamburger Button - Mobile 
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          // Desktop Navigation 
          <ul className="hidden md:flex space-x-4 text-gray-700 font-bold">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-blue-600 px-3 py-1 rounded ${isActive ? "bg-red-400" : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-blue-600 px-3 py-1 rounded ${isActive ? "bg-red-400" : ""}`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-blue-600 px-3 py-1 rounded ${isActive ? "bg-red-400" : ""}`
              }
            >
              Contact
            </NavLink>
          </ul>

          // Desktop Buttons 
          <div className="hidden md:flex space-x-4">
            {!loggedIn && (
              <>
                <Link to="/signIn">
                  <button className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUp">
                  <button className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {loggedIn && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();       // prevent menu close before click
                    handleLogOut(e);
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  Logout
                </button>


                <Link to="/upload">
                  <button className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Upload Project
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        // Mobile Menu Dropdown 
        {menuOpen && (
          <div className="md:hidden bg-white w-full px-4 py-3 space-y-4 shadow-inner">

            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-1"
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-1"
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-1"
            >
              Contact
            </NavLink>

            {!loggedIn && (
              <>
                <Link to="/signIn" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUp" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {loggedIn && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogOut(e);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  Logout
                </button>

                <Link to="/upload" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Upload Project
                  </button>
                </Link>
              </>
            )}

          </div>
        )}

      </nav>
    </>
  );
};

export default Navbar;

*/

import axios from "axios";
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogOut = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/logOut', {}, { withCredentials: true });
      setLoggedIn(false);
      localStorage.removeItem('userEmail'); // Clear stored email
      alert(response.data.message);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <>
      <nav className="bg-white fixed top-0 left-0 right-0 shadow-md w-full py-3 z-10">
        <div className="flex justify-between items-center px-4 sm:px-8">
          
          {/* Logo */}
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
          𝓓𝓮𝓿𝓮𝓵𝓸𝓹𝓮𝓻 𝓒𝓸𝓵𝓵𝓪𝓫𝓸𝓻𝓪𝓽𝓲𝓸𝓷 𝓟𝓵𝓪𝓽𝓯𝓸𝓻𝓶
          </h1>

          {/* Hamburger Button - Mobile */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-4 text-gray-700 font-bold items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-blue-600 px-3 py-1 rounded ${isActive ? "bg-red-400" : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-blue-600 px-3 py-1 rounded ${isActive ? "bg-red-400" : ""}`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `hover:text-blue-600 px-3 py-1 rounded ${isActive ? "bg-red-400" : ""}`
              }
            >
              Contact
            </NavLink>

           
          </ul>

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4 items-center">
            {!loggedIn && (
              <>
                <Link to="/signIn">
                  <button className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUp">
                  <button className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {loggedIn && (
              <>
               {/* Notification Bell (only when logged in) */}
            {loggedIn && <NotificationBell />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogOut(e);
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  Logout
                </button>

                <Link to="/upload">
                  <button className="px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Upload Project
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white w-full px-4 py-3 space-y-4 shadow-inner">
            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-1"
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-1"
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-1"
            >
              Contact
            </NavLink>

            {/* Mobile Notification Bell */}
            {loggedIn && (
              <div className="py-2">
                <NotificationBell />
              </div>
            )}

            {!loggedIn && (
              <>
                <Link to="/signIn" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUp" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {loggedIn && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogOut(e);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition"
                >
                  Logout
                </button>

                <Link to="/upload" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
                    Upload Project
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;

