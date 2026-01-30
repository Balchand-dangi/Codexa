import axios from "axios";
import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import codexa from '../assets/codexaa.png'

const Navbar = ({ user,setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayName =
  user?.name ||
  user?.email?.split("@")[0] ||
  "";


  const handleLogOut = async (e) => {
    //console.log("Logging out user");
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/logOut', {}, { withCredentials: true });
      setUser(null);
      setShowProfileMenu(false);
      alert(response.data.message);
      //console.log("Logout successful");
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Something went wrong");
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 bg-indigo-600 shadow-lg z-50 w-full py-1.5">
        <div className="flex justify-between items-center px-4 sm:px-8">
          <Link to="/Home">
            <img className="h-10 w-auto rounded-sm" src={codexa} alt="DevHubLogo" />
          </Link>

          {/* Hamburger Button - Mobile */}
          <button
            className="md:hidden text-2xl text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-4 text-white font-semibold items-center">
            <NavLink
              to="/Home"
              className={({ isActive }) =>
                `hover:text-yellow-300 px-3 py-2 rounded transition-colors ${isActive ? "bg-white/20 text-yellow-300" : ""}`
              }
            >Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-yellow-300 px-3 py-2 rounded transition-colors ${isActive ? "bg-white/20 text-yellow-300" : ""}`
              }
            >About
            </NavLink>

            <NavLink
              to="/support"
              className={({ isActive }) =>
                `hover:text-yellow-300 px-3 py-2 rounded transition-colors ${isActive ? "bg-white/20 text-yellow-300" : ""}`
              }
            >Support
            </NavLink>
          </ul>

          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4 items-center">
            {!user && (
              <>
                <Link to="/signInForm">
                  <button className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-yellow-300 hover:text-indigo-700 transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUpForm">
                  <button className="px-4 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {user && (
              <>
                {/* Notification Bell - Desktop Only */}
                <NotificationBell />

                {/* Upload Project Button */}
                <Link to="/upload">
                  <button className="px-4 py-2 bg-yellow-400 cursor-pointer text-indigo-700 font-semibold rounded-lg hover:bg-yellow-300 transition flex items-center gap-2">
                    <span>Upload project</span>
                  </button>
                </Link>

                {/* Profile dropdown with avatar */}
                <div className="relative">
                  <div
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    {/* Avatar Icon */}
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-indigo-700">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-semibold hidden lg:block">
                      {displayName}
                    </span>
                    <svg
                      className={`w-4 h-4 text-white transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Dropdown Menu with Backdrop */}
                  {showProfileMenu && (
                    <>
                      {/* Backdrop - Closes dropdown when clicking outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          setShowProfileMenu(false)
                        }}
                      />

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-600">Signed in as</p>
                          <p className="text-sm font-semibold text-indigo-600 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/Myprofile"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                        >
                          👤 My Profile
                        </Link>

                        <Link
                          to="/MyProjects"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                        >
                          📁 My Projects
                        </Link>

                        <hr className="my-2" />

                        <button
                          onClick={(e) => {
                            handleLogOut(e);
                            setShowProfileMenu(false);
                          }}
                          disabled={isSubmitting}
                          className="w-full cursor-pointer text-left px-4 py-2 text-red-600 hover:bg-red-200 transition font-semibold"
                        >
                          {isSubmitting ? '🔄 Logging Out...' : '🚪 Log Out'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu with slide animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="bg-indigo-700 px-4 py-3 space-y-3">
            {/* User info on mobile when logged in */}
            {user && (
              <div className="flex items-center space-x-3 pb-3 border-b border-indigo-500">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{displayName}</p>
                  <p className="text-white/70 text-xs truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            <NavLink
              to="/Home"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-2 text-white hover:text-yellow-300 transition"
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-2 text-white hover:text-yellow-300 transition"
            >
              About
            </NavLink>

            <NavLink
              to="/support"
              onClick={() => setMenuOpen(false)}
              className="block font-semibold py-2 text-white hover:text-yellow-300 transition"
            >
              Support
            </NavLink>

            {/* Mobile Notification Bell - Only when menu is open */}
            {user && menuOpen && (
              <div className="py-1 border-t border-indigo-500">
                <NotificationBell />
              </div>
            )}

            {!user && (
              <div className="space-y-3 pt-3">
                <Link to="/signInForm" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-yellow-300 transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUpForm" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 mt-1 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {user && (
              <div className="space-y-3 pt-3 border-t border-indigo-500">
                <Link to="/MyProfile" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-indigo-600 rounded-lg transition">
                    👤 My Profile
                  </button>
                </Link>
                <Link to="/MyProjects" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-indigo-600 rounded-lg transition">
                    📁 My Projects
                  </button>
                </Link>

                <Link to="/upload" onClick={() => setMenuOpen(false)}>
                  <button className="w-full m-1 px-4 py-2 bg-yellow-400 text-indigo-700 font-semibold rounded-lg hover:bg-yellow-300 transition">
                    Upload Project
                  </button>
                </Link>

                <button
                  onClick={(e) => {
                    handleLogOut(e);
                    setMenuOpen(false);
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                >
                  {isSubmitting ? ' Logging Out...' : ' Log Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
