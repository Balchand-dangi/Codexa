import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import codexa from '../assets/codexaa.png'
import toast from 'react-hot-toast'


const Navbar = ({ user, setUser, socket }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown on outside click/tap
  useEffect(() => {
    if (!showProfileMenu) return
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showProfileMenu]);

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "";


  const handleLogOut = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/auth/logOut', {}, { withCredentials: true });
      setUser(null);
      setShowProfileMenu(false);
      toast.success(response.data.message || 'Logged out successfully');
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl z-50 w-full py-1.5">
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
                  <button className="px-4 py-2 bg-slate-700 text-slate-200 cursor-pointer  font-semibold rounded-lg  border-slate-600 hover:bg-slate-600  active:scale-95 transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUpForm">
                  <button className="px-4 py-2 border-1 cursor-pointer border-white text-white font-semibold rounded-lg hover:bg-slate-600  transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            {user && (
              <>
                {/* Notification Bell - Desktop Only */}
                {user.role !== 'admin' && <NotificationBell socket={socket} />}

                {/* Upload Project Button */}
                {user.role !== 'admin' && (
                  <Link to="/upload">
                    <button className="px-4 py-2 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600 transition">
                      Upload Project
                    </button>
                  </Link>
                )}

                {/* Profile dropdown with avatar */}
                <div className="relative" ref={profileRef}>
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

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <>
                      <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-[9999] overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-700">
                          <p className="text-xs text-slate-500 mb-0.5">Signed in as
                            <span className="font-bold text-violet-400"> {user.role === 'admin' ? 'Admin' : 'User'}</span>
                          </p>
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/Myprofile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-700/60 hover:text-white transition text-sm"
                        >
                          👤 My Profile
                        </Link>

                       {/* Only show My Projects if user is not admin (since admins don't have projects) else show Admin Panel link */}
                        {user.role !== 'admin' ? (
                          <Link
                            to="/MyProjects"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-700/60 hover:text-white transition text-sm"
                          >
                            📁 My Projects
                          </Link>
                        ) : (
                          <Link
                            to="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-700/60 hover:text-white transition text-sm"
                          >
                            ⚙️ Admin Panel
                          </Link>
                        )}

                        <div className="my-1.5 border-t border-slate-700" />

                        <button
                          onClick={(e) => {
                            handleLogOut(e);
                            setShowProfileMenu(false);
                          }}
                          disabled={isSubmitting}
                          className="w-full cursor-pointer text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition font-semibold text-sm"
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
          <div className="bg-slate-800 border border-slate-700 px-4 py-3 space-y-3">
            {/* User info on mobile when logged in */}
            {user && (
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-700">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-indigo-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{displayName}</p>
                  <p className="text-sm text-white/70">Signed in as
                    <span className="font-bold text-yellow-400"> {user.role === 'admin' ? ' Admin' : ' User'}</span>
                  </p>

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
            {user && user.role !== 'admin' && menuOpen && (
              <div className="py-1 border-t border-slate-700">
                <NotificationBell socket={socket} />
              </div>
            )}

            {!user && (
              <div className="space-y-3 pt-3">
                <Link to="/signInForm" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 bg-slate-700 text-slate-200 cursor-pointer  font-semibold rounded-lg  border-slate-600 hover:bg-slate-600  active:scale-95 transition">
                    Sign In
                  </button>
                </Link>

                <Link to="/signUpForm" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 mt-1 border-1 cursor-pointer border-white text-white font-semibold rounded-lg hover:bg-slate-600  transition">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {user && (
              <div className="space-y-3 pt-3 border-t border-slate-700">
                <Link to="/MyProfile" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 rounded-lg transition text-sm">
                    👤 My Profile
                  </button>
                </Link>
                {user.role !== 'admin' ? (
                  <Link to="/MyProjects" onClick={() => setMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 rounded-lg transition text-sm">
                      📁 My Projects
                    </button>
                  </Link>
                ) : (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 rounded-lg transition text-sm">
                      ⚙️ Admin Panel
                    </button>
                  </Link>
                )}

                <hr className="border-slate-700 my-2" />

                {user.role !== "admin" && (
                  <Link to="/upload" onClick={() => setMenuOpen(false)}>
                    <button
              
                  className="w-full  mt-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                >
                  Upload project
                </button>
                  </Link>
                )}
                <button
                  onClick={(e) => {
                    handleLogOut(e);
                    setMenuOpen(false);
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 my-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
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
