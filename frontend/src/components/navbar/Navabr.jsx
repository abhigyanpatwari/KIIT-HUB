import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Navbar } from "flowbite-react/lib/esm/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";
import { useTheme } from "../../Contexts/ThemeContext";
import ThemeToggle from "../Theme/ThemeToggle";
import profilePic from "./images.png";

const Navabr = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    authUser,
    setAuthUser,
    isloggedin,
    setIsloggedin,
    logout
} = useAuth();

  // Add scroll listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Modified logout function to use the auth context's logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.log(err);
      window.alert("Error logging out. Please try again.");
    }
  };

  // Check if a NavLink is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get user avatar from auth or local storage
  const userAvatar = authUser?.avatar || localStorage.getItem('userAvatar') || profilePic;

  return (
    <div className={`fixed w-full z-[1000] transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : isDark ? 'bg-gray-900' : 'bg-gradient-to-r from-gray-900 to-black'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink 
              to="/"
              className="flex items-center"
            >
              <span className="font-extrabold text-transparent text-2xl bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 transition-all duration-500">
              KIIT-HUB
            </span>
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle className="mr-1" />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => document.getElementById('mobile-menu').classList.toggle('hidden')}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <NavLink
                to="/Home"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                  isActive('/Home') 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                Home
              </NavLink>
              <NavLink
                to="/aboutus"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                  isActive('/aboutus') 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                  isActive('/contact') 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                Contact
              </NavLink>
              <NavLink
                to="/testimonials"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                  isActive('/testimonials') 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                Testimonials
              </NavLink>
              <NavLink
                to="/form"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                  isActive('/form') 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                Post Item
              </NavLink>
              {isloggedin && (
                <NavLink
                  to="/saved-items"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                    isActive('/saved-items') 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700/30'
                  }`}
                >
                  Saved Items
                </NavLink>
              )}
              {isloggedin ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600/80 hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              ) : (
                <NavLink
                  to="/signin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-white transform hover:scale-105 ${
                    isActive('/signin')
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                      : 'text-gray-300 hover:bg-emerald-600/30'
                  }`}
                >
                  Login
                </NavLink>
              )}
              <ThemeToggle />
            </div>
        </div>
          
          {/* Profile icon */}
          <div className="hidden md:block">
            <NavLink
            to="/profile"
              className="group relative flex items-center"
            >
              <div className="w-10 h-10 overflow-hidden rounded-full border-2 border-purple-500 shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:border-indigo-400 group-hover:scale-110">
                <img 
                  src={userAvatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profilePic;
                  }}
                />
              </div>
              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
                Profile
              </span>
          </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="hidden md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-b from-gray-900 to-black backdrop-blur-lg border-t border-gray-700/30">
          <NavLink
            to="/Home"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/Home') 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Home
            </NavLink>
          <NavLink
            to="/aboutus"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/aboutus') 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/contact') 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Contact
          </NavLink>
          <NavLink
            to="/testimonials"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/testimonials') 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Testimonials
          </NavLink>
          <NavLink
            to="/form"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/form') 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Post Item
          </NavLink>
          {isloggedin && (
            <NavLink
              to="/saved-items"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/saved-items') 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Saved Items
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/profile') 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-6 h-6 rounded-full mr-2 border border-purple-400"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = profilePic;
                }}
              />
              Profile
            </div>
          </NavLink>
          {isloggedin ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-red-600 hover:text-white"
            >
              Logout
        </button>
          ) : (
            <NavLink
            to="/signin"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/signin')
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  : 'text-gray-300 hover:bg-emerald-600 hover:text-white'
              }`}
          >
            Login
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navabr;
