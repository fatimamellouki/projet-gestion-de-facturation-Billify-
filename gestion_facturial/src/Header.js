import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import logo from './images/logo.png';
import { useTheme } from './ThemeContext';
import { ThemeProvider } from './ThemeContext';

const menuItems = [
  { name: "Accueil", path: "/" },
  { name: "Fonctionnalités", path: "/services" },
  { name: "Tarifs", path: "/pricing" },
  { name: "Contact", path: "/contact" },
];

function Headers() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY >= 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    navigate('/');
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          sticky 
            ? `${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg` 
            : 'bg-transparent shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <img 
                src={logo} 
                alt="Billify Logo" 
                className={`transition-all duration-300 ${
                  sticky ? 'h-10 w-10' : 'h-12 w-12'
                } mr-3 rounded-full border-2 border-blue-500 bg-blue-600`}
              />
              <span className={`text-xl font-bold transition-all duration-300 ${
                sticky 
                  ? (theme === 'dark' ? 'text-white' : 'text-gray-900')
                  : 'text-black'
              }`}>Billify</span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`font-medium transition-colors ${
                      location.pathname === item.path 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : sticky 
                          ? (theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600')
                          : 'text-black hover:text-blue-300'
                    } relative py-2`}
                  >
                    {item.name}
                    {location.pathname === item.path && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                sticky 
                  ? (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200')
                  : 'hover:bg-white hover:bg-opacity-20'
              }`}
              aria-label={`Basculer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
            >
              {theme === 'light' 
                ? <FiMoon size={20} className={sticky ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-black'} /> 
                : <FiSun size={20} className={sticky ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-black'} />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <button className={`p-2 rounded-full transition-colors ${
                  sticky 
                    ? (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200')
                    : 'hover:bg-white hover:bg-opacity-20'
                }`}>
                  <FiUser size={20} className={sticky ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-black'} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center space-x-2"
                >
                  <FiLogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/login" 
                  className={`border font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-200 ${
                    sticky
                      ? 'bg-white text-blue-600 hover:bg-gray-50 border-blue-600'
                      : 'bg-transparent text-black border-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Connexion
                </Link>
                <Link 
                  to="/demandeAcces" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200"
                >
                  Demande d'accès
                </Link>
              </div>
            )}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-colors ${
                sticky 
                  ? (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200')
                  : 'hover:bg-white hover:bg-opacity-20'
              }`}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen 
                ? <FiX size={24} className={sticky ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-black'} /> 
                : <FiMenu size={24} className={sticky ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : 'text-black'} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            ref={menuRef}
            className={`fixed top-0 right-0 w-80 h-full ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-xl transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-4 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            } border-b`}>
              <Link 
                to="/" 
                className="flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img 
                  src={logo} 
                  alt="Billify Logo" 
                  className="h-10 w-10 mr-2 rounded-full border-2 border-blue-500 bg-blue-600"
                />
                <span className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }  'text-black'`}>Billify</span>
              </Link>
            </div>

            <nav className="p-4 flex-1">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`block py-2 font-medium ${
                        location.pathname === item.path
                          ? 'text-blue-600 dark:text-blue-400'
                          : theme === 'dark' 
                            ? 'text-gray-300 hover:text-blue-400' 
                            : 'text-gray-700 hover:text-blue-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={`p-4 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            } border-t`}>
              <button 
                onClick={toggleTheme}
                className={`w-full flex items-center space-x-2 p-3 rounded-md transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
                <span>Mode {theme === 'light' ? 'sombre' : 'clair'}</span>
              </button>

              {isLoggedIn ? (
                <button 
                  onClick={handleLogout}
                  className="w-full mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FiLogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              ) : (
                <div className="mt-1 space-y-3">
                  <Link 
                    to="/login" 
                    className={`block w-full border font-medium py-2 px-4 rounded-md shadow-sm text-center transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' 
                        : 'bg-white text-blue-600 border-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/demandeAcces" 
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm text-center transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Demande d'accès
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Header() {
  return (
    <ThemeProvider>
      <Headers />
    </ThemeProvider>
  );
}