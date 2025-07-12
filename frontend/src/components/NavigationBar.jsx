import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "../ThemeContext";
import logo from "../Asset/Habesha_Community.jpg"
import nael from "../Asset/nael.png"

const NavigationBar = ({ onLogoClick = () => {} }) => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.id,
            role: decoded.role,
            user_name: decoded.user_name,
            user_image: decoded.user_image
          });

          try {
            const response = await axios.get(`http://localhost:5000/user/${decoded.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(prev => ({ 
              ...prev, 
              ...response.data.user,
              user_image: response.data.user.user_image || prev.user_image
            }));
          } catch (apiError) {
            console.error("Additional user fetch failed:", apiError);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  // Role-based navigation links
  const getNavLinks = () => {
    if (!user) {
      return [
        { name: "Login", path: "/login" },
        { name: "Register", path: "/register" }
      ];
    }

    const baseLinks = [
      { name: "Home", path: "/" },
      { name: "Create", path: "/create" }
    ];

    if (user.role === "admin") {
    
    }

    if (user.role === "subadmin") {
      baseLinks.push(
        { name: "Tags", path: "/tags" }
      );
    }

    return baseLinks;
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      sessionStorage.removeItem("token");
      setUser(null);
      setMobileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getOptimizedImageUrl = (url) => {
    if (!url) return null;
    if (url.includes('upload/') && (url.includes('w_') || url.includes('h_'))) {
      return url;
    }
    return url.replace('/upload/', '/upload/w_32,h_32,c_fill,g_face,f_auto,q_auto/');
  };

  // Animation variants
  const mobileMenuVariants = {
    open: { 
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      opacity: 0,
      y: -20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const navItemVariants = {
    hover: { 
      scale: 1.05,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md ${
        theme === 'dark' ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-900'
      } ${
        isScrolled ? (theme === 'dark' ? 'shadow-lg shadow-gray-900/50' : 'shadow-md shadow-gray-200/50') : ''
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-current" />
              ) : (
                <Menu size={24} className="text-current" />
              )}
            </button>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <Link 
                to="/" 
                onClick={onLogoClick}
                className="flex items-center gap-2"
              >
                {/* Replace with your actual logo */}
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold`}>
                  <img src={nael} alt="" />
                </div>
                <span className="habesha-blog font-bold text-xs hidden sm:block text-green ">Habesha Blog</span>
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Theme Toggle */}
            <motion.button 
              onClick={toggleTheme}
              whileHover="hover"
              whileTap="tap"
              variants={navItemVariants}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'text-yellow-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Navigation Links */}
            {getNavLinks().map((link) => (
              <motion.div
                key={link.name}
                whileHover="hover"
                whileTap="tap"
                variants={navItemVariants}
              >
                <Link 
                  to={link.path}
                  className={`font-medium px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}

            {/* User Avatar */}
            {user && (
              <Popover>
                <PopoverTrigger className="focus:outline-none">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Avatar className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all">
                      {user.user_image ? (
                        <AvatarImage 
                          src={getOptimizedImageUrl(user.user_image)} 
                          alt={user.user_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : null}
                      <AvatarFallback className={`flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      } text-white w-full h-full rounded-full font-medium`}>
                        {user.user_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent 
                  className={`rounded-lg shadow-lg z-50 min-w-[180px] p-1 ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } border`}
                  align="end"
                  sideOffset={10}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1"
                  >
                    <Link 
                      to="/profile" 
                      className={`px-4 py-2 rounded-md text-sm transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/chat" 
                      className={`px-4 py-2 rounded-md text-sm transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      support
                    </Link>
                   
                    <button 
                      onClick={handleLogout}
                      className={`px-4 py-2 rounded-md text-left text-sm transition-colors ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>
                  </motion.div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className={`md:hidden fixed inset-0 mt-16 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
              }`}
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
                {/* Theme Toggle */}
                <motion.button 
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  {theme === 'dark' ? (
                    <Sun size={20} className="text-yellow-300" />
                  ) : (
                    <Moon size={20} className="text-gray-700" />
                  )}
                  <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                </motion.button>

                {/* Navigation Links */}
                {getNavLinks().map((link) => (
                  <motion.div
                    key={link.name}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block p-3 rounded-lg font-medium ${
                        theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                {/* User Section */}
                {user && (
                  <div className={`mt-4 pt-4 border-t ${
                    theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-4 p-3">
                      <Avatar className="w-10 h-10 rounded-full">
                        {user.user_image ? (
                          <AvatarImage 
                            src={getOptimizedImageUrl(user.user_image)} 
                            alt={user.user_name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : null}
                        <AvatarFallback className={`flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        } text-white w-full h-full rounded-full font-medium`}>
                          {user.user_name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.user_name}</span>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block p-3 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block p-3 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className={`w-full text-left p-3 rounded-lg ${
                        theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NavigationBar;

