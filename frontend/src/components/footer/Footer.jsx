import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../Contexts/ThemeContext";

function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const notify = () => {
    const emailInput = document.getElementById('newsletter-email');
    
    if (!emailInput.value || !emailInput.value.includes('@')) {
      toast.error("Please enter a valid email address", {
        position: "bottom-right",
        autoClose: 3000,
        theme: isDark ? 'dark' : 'light'
      });
      return;
    }
    
    toast.success("Successfully subscribed to our newsletter!", {
      position: "bottom-right",
      autoClose: 3000,
      theme: isDark ? 'dark' : 'light'
    });
    emailInput.value = '';
  };

  return (
    <footer className={`relative mt-16 ${isDark ? 'bg-gradient-to-b from-gray-900 to-black' : 'bg-gradient-to-b from-gray-100 to-gray-200'} ${isDark ? 'text-white' : 'text-gray-800'} overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="absolute top-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className={`rotate-180 ${isDark ? 'text-gray-900' : 'text-gray-100'} fill-current opacity-10`}>
          <path fillOpacity="1" d="M0,96L60,117.3C120,139,240,181,360,181.3C480,181,600,139,720,138.7C840,139,960,181,1080,170.7C1200,160,1320,96,1380,64L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {/* Logo and branding section */}
          <div className="col-span-1 lg:col-span-1">
            <div className="mb-6">
              <Link to="/" className="inline-block group">
                <span className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:to-indigo-500 transition-all duration-500">
                  KIIT-HUB
                </span>
              </Link>
              <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm leading-relaxed`}>
                The premier marketplace for KIIT students to buy, sell, and exchange items within our community.
              </p>
            </div>

            {/* Social links */}
            <div className="flex space-x-4 mt-6">
              <a href="#" target="_blank" rel="noopener noreferrer" className="transform transition-all duration-300 hover:scale-110">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} hover:bg-indigo-600 hover:text-white transition-colors duration-300`}>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="transform transition-all duration-300 hover:scale-110">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} hover:bg-purple-600 hover:text-white transition-colors duration-300`}>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </div>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="transform transition-all duration-300 hover:scale-110">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} hover:bg-blue-600 hover:text-white transition-colors duration-300`}>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.497 14-13.987 0-.21 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
                  </svg>
                </div>
              </a>
              <a href="https://github.com/HarshShandilya16" target="_blank" rel="noopener noreferrer" className="transform transition-all duration-300 hover:scale-110">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} hover:bg-gray-600 hover:text-white transition-colors duration-300`}>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-indigo-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/Home" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/aboutus" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/form" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Sell Item
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Section */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4 relative inline-block">
              Help & Support
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-purple-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/faq" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/partners" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link to="/refund" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300 inline-block transform hover:translate-x-1`}>
                  Refund Policy
                </Link>
              </li>
            </ul>
        </div>

          {/* Newsletter Section */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="font-semibold text-lg mb-4 relative inline-block">
              Newsletter
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-pink-500"></span>
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-4`}>
              Subscribe to our newsletter for updates, new features, and exclusive offers.
            </p>
            <div className="flex mb-4">
          <input
                id="newsletter-email"
                type="email"
                className={`flex-grow px-4 py-2 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} rounded-l-md border ${isDark ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                placeholder="Your email address"
              />
          <button
                onClick={notify}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-r-md shadow-md transition-all duration-300 hover:shadow-lg"
          >
            Subscribe
          </button>
        </div>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom section with copyright and credits */}
        <div className={`pt-8 mt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-300'} flex flex-col md:flex-row justify-between items-center`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            © {currentYear} KIIT-HUB. All rights reserved.
          </p>
          <div className="flex mt-4 md:mt-0">
            <Link to="/privacy" className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} mx-2 transition-colors duration-300`}>
              Privacy
            </Link>
            <Link to="/terms" className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} mx-2 transition-colors duration-300`}>
              Terms
            </Link>
            <Link to="/contact" className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} mx-2 transition-colors duration-300`}>
              Contact
            </Link>
          </div>
        </div>
    </div>
      <ToastContainer />
    </footer>
  );
}

export default Footer;
