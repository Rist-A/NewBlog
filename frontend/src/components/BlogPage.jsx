import React, { useEffect, useState, useRef } from "react";
import { ArrowRight, ArrowLeft, Menu, X } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import CommentDetail from "./CommentDetail";
import comment from "../Asset/comment.png";
import SaveButton from "./SaveButton.jsx";
import { useTheme } from "../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const BlogPage = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const postsPerPage = 4;
  const navigate = useNavigate();
  const location = useLocation();
  const topRef = useRef(null);

  // NAEL PRODUCTION THEME COLORS
  const bgColor = theme === 'dark' ? 'bg-[#061012]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#061012]';
  const secondaryTextColor = theme === 'dark' ? 'text-[#A3B3BC]' : 'text-[#4A5A63]';
  const accentColor = theme === 'dark' ? 'text-[#FFD700]' : 'text-[#C9A227]';
  const accentBgColor = theme === 'dark' ? 'bg-[#FFD70022]' : 'bg-[#FFD70011]';
  const cardBgColor = theme === 'dark' ? 'bg-[#0E1A1F]' : 'bg-[#F8F9FA]';
  const borderColor = theme === 'dark' ? 'border-[#1E2D33]' : 'border-[#E0E6EA]';
  const dropdownBgColor = theme === 'dark' ? 'bg-[#0E1A1F]' : 'bg-white';
  const dropdownHoverColor = theme === 'dark' ? 'hover:bg-[#1E2D33]' : 'hover:bg-[#F8F9FA]';
  const goldHover = 'hover:text-[#FFD700] transition-colors duration-300';

  // Hero section content
  const heroContent = [
    {
      title: "Nael Production Studio",
      subtitle: "Cinematic Excellence in Every Frame",
      buttonText: "Explore Our Work",
      backgroundImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      title: "Film Production Services",
      subtitle: "Bringing Your Vision to Life",
      buttonText: "View Portfolio",
      backgroundImage: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      title: "Creative Storytelling",
      subtitle: "Where Imagination Meets Reality",
      buttonText: "Start a Project",
      backgroundImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    }
  ];

  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [nextContentIndex, setNextContentIndex] = useState(1);
  const [textAnimation, setTextAnimation] = useState({
    fadeOut: false,
    slideDirection: 'up'
  });

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      // Phase 1: Start fading out text (500ms)
      setTextAnimation({
        fadeOut: true,
        slideDirection: 'up'
      });
      
      // Phase 2: Change background image exactly when text is fully faded out
      setTimeout(() => {
        setCurrentBackgroundIndex(nextContentIndex);
        setNextContentIndex((nextContentIndex + 1) % heroContent.length);
        
        // Phase 3: Start fading in new text immediately
        setTextAnimation({
          fadeOut: false,
          slideDirection: 'down'
        });
      }, 500); // Matches the text fade-out duration
    }, 6000); // Total cycle time (6 seconds)

    return () => clearInterval(interval);
  }, [nextContentIndex]);

  // Scroll to top when page changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  // Fetch posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        
        // Fetch posts
        const postsResponse = await fetch("http://localhost:5000/posts", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts");
        }
        
        let postsData = await postsResponse.json();

        // Transform the API response
        postsData = postsData.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          image_url: post.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
          created_at: post.createdAt,
          updated_at: post.updatedAt,
          user_name: post.author?.user_name || 'Anonymous',
          user_image_url: post.author?.user_image || 'default-user-image-url.jpg',
          likes: post.like_count || 0,
          comments_count: post.comment_count || 0,
          category: post.category?.category_name || 'Uncategorized',
          category_id: post.category?.id || null,
          isLiked: post.isLiked || false
        }));

        // Sort posts by creation date (newest first)
        const sortedPosts = postsData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAllPosts(sortedPosts);
        setPosts(sortedPosts);

        // Fetch categories
        const categoriesResponse = await fetch("http://localhost:5000/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts by category
  useEffect(() => {
    if (selectedCategory === "All") {
      setPosts(allPosts);
    } else {
      const filtered = allPosts.filter(post => post.category === selectedCategory);
      setPosts(filtered);
    }
    setCurrentPage(1); // Reset to first page when category changes
  }, [selectedCategory, allPosts]);

  // Recent posts for the "Recent Productions" section
  const recentPosts = allPosts.slice(0, 3);
  
  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Handle card click - navigate to CommentDetail
  const handleCardClick = (postId) => {
    navigate(`/posts/${postId}/comments`);
  };

  // Like handler
  const handleLike = async (postId, e) => {
    e.stopPropagation(); // Prevent card click when liking
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setLoadingStates(prev => ({ ...prev, [postId]: true }));

    try {
      // Optimistic update
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const newLikeStatus = !post.isLiked;
            return {
              ...post,
              isLiked: newLikeStatus,
              likes: newLikeStatus ? post.likes + 1 : post.likes - 1
            };
          }
          return post;
        })
      );

      const response = await fetch(`http://localhost:5000/posts/${postId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const data = await response.json();
      // Final update with server data
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: data.liked,
              likes: data.likeCount
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            };
          }
          return post;
        })
      );
      alert('Failed to update like. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [postId]: false }));
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`${accentColor} text-2xl font-semibold`}>Loading Productions...</div>
          <div className="mt-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`text-red-500 text-2xl font-semibold`}>Error Loading Data</div>
          <div className={`${textColor} mt-2`}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className={`mt-4 px-4 py-2 ${accentColor} border border-[#FFD700] rounded-lg hover:bg-[#FFD70022] transition-colors`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`min-h-screen ${bgColor} ${textColor} w-full`} ref={topRef}>
          {/* Mobile Menu Button */}
          <div className="md:hidden fixed top-4 right-4 z-50">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#0E1A1F]' : 'bg-[#F8F9FA]'} ${goldHover}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div 
              className={`fixed inset-0 z-40 ${theme === 'dark' ? 'bg-[#061012]' : 'bg-white'} p-6 transition-transform duration-300`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-8">
                  <button onClick={() => setMobileMenuOpen(false)} className={goldHover}>
                    <X size={24} />
                  </button>
                </div>
                <nav className="flex flex-col gap-6 text-xl">
                  <Link to="/" className={`${goldHover}`}>Home</Link>
                  <Link to="/create" className={`${goldHover}`}>Create Post</Link>
                  <Link to="/profile" className={`${goldHover}`}>Profile</Link>
                  <Link to="/login" className={`${goldHover}`}>Login</Link>
                </nav>
              </div>
            </div>
          )}
          
          {/* Hero Section with Sliding Animation */}
          <div className="w-full h-screen relative overflow-hidden">
            {heroContent.map((content, index) => (
              <motion.div
                key={index}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentBackgroundIndex === index ? 1 : 0,
                  transition: { duration: 1 }
                }}
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(6, 16, 18, 0.7), rgba(6, 16, 18, 0.7)), url(${content.backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  zIndex: currentBackgroundIndex === index ? 1 : 0,
                }}
              />
            ))}
            
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 z-10 ${
                textAnimation.fadeOut 
                  ? `opacity-0 ${textAnimation.slideDirection === 'up' ? 'translate-y-4' : '-translate-y-4'}`
                  : 'opacity-100 translate-y-0'
              }`}
              style={{
                transition: "opacity 500ms ease-in-out, transform 500ms ease-in-out"
              }}
            >
              <div className={`font-semibold ${accentColor} text-lg mb-2 tracking-widest`}>
                NAEL PRODUCTION
              </div>
              <h1 className="text-5xl font-bold mt-4 text-white">
                {heroContent[currentBackgroundIndex].title}
              </h1>
              <div className="text-xl mt-4 text-[#A3B3BC] max-w-2xl mx-auto">
                {heroContent[currentBackgroundIndex].subtitle}
              </div>
              <div className="flex gap-x-4 mt-8 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-48 h-12 ${accentColor} bg-transparent border-2 border-[#FFD700] font-semibold flex items-center justify-center rounded-lg ${
                    textAnimation.fadeOut ? 'scale-90' : 'scale-100'
                  } ${goldHover}`}
                  style={{ transition: "transform 300ms ease-in-out" }}
                  onClick={() => navigate("/login")}
                >
                  {heroContent[currentBackgroundIndex].buttonText}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Recent Productions Section with Modern Hover Effects */}
          <section className="py-16 px-4 md:px-28">
            <h2 className={`font-bold text-3xl md:text-4xl mb-8 ${textColor} relative inline-block`}>
              Recent Productions
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD700]"></span>
            </h2>
            {recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -10 }}
                    className="relative group cursor-pointer"
                    onClick={() => handleCardClick(post.id)}
                  >
                    <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                    <div className="absolute inset-0 border border-[#FFD700] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                    
                    <motion.article 
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl overflow-hidden shadow-xl ${cardBgColor} transition-all duration-300 relative z-10 h-full`}
                    >
                      <div className="w-full h-48 md:h-64 relative overflow-hidden">
                        <img
                          src={post.image_url}
                          alt="Production"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061012] via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-4">
                          <span className={`${accentColor} text-sm font-semibold`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${secondaryTextColor} text-sm`}>
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <img
                              src={post.user_image_url}
                              alt="Director"
                              className="w-8 h-8 rounded-full border border-[#FFD700]"
                            />
                            <span className={`text-sm ${textColor}`}>{post.user_name}</span>
                          </div>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${textColor} group-hover:${accentColor} transition-colors`}>
                          {post.title}
                        </h3>
                        <p className={`${secondaryTextColor} mb-4 line-clamp-3`}>
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleLike(post.id, e)}
                              disabled={loadingStates[post.id]}
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                                post.isLiked 
                                  ? `${accentColor} bg-[#FFD70033]`
                                  : `${secondaryTextColor} ${theme === 'dark' ? 'bg-[#1E2D33]' : 'bg-[#E0E6EA]'} hover:bg-[#FFD70033]`
                              } ${loadingStates[post.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {post.isLiked ? '❤️' : '♡'} {post.likes}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(post.id);
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                                theme === 'dark' ? 'bg-[#1E2D33]' : 'bg-[#E0E6EA]'
                              } hover:bg-[#FFD70033] ${secondaryTextColor} hover:text-[#FFD700]`}
                            >
                              💬 {post.comments_count}
                            </button>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <SaveButton postId={post.id} />
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${secondaryTextColor}`}>
                No recent productions found.
              </div>
            )}
          </section>

          {/* All Productions Section with Modern Hover Effects */}
          <section className="py-16 px-4 md:px-28">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className={`font-bold text-3xl md:text-4xl ${textColor} relative inline-block`}>
                All Productions
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD700]"></span>
              </h2>
              
              {/* Category Picker */}
              <div className="relative mt-4 md:mt-0">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`flex items-center justify-between w-full md:w-48 px-4 py-3 rounded-lg ${dropdownBgColor} border ${borderColor} shadow-sm ${textColor} hover:border-[#FFD700] transition-colors`}
                >
                  <span>{selectedCategory}</span>
                  <svg
                    className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isCategoryDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 w-full md:w-48 mt-1 rounded-lg shadow-xl ${dropdownBgColor} border ${borderColor} max-h-60 overflow-auto`}
                    onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-3 ${
                        selectedCategory === "All" ? `${accentBgColor} ${accentColor}` : `${textColor} ${dropdownHoverColor}`
                      } transition-colors`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.category_name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-3 ${
                          selectedCategory === category.category_name ? `${accentBgColor} ${accentColor}` : `${textColor} ${dropdownHoverColor}`
                        } transition-colors`}
                      >
                        {category.category_name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
            
            {currentPosts.length === 0 ? (
              <div className={`text-center py-12 ${secondaryTextColor}`}>
                No productions found in this category.
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {currentPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -10 }}
                    className="relative group cursor-pointer"
                    onClick={() => handleCardClick(post.id)}
                  >
                    <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                    <div className="absolute inset-0 border border-[#FFD700] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                    
                    <motion.article 
                      whileHover={{ scale: 1.02 }}
                      className={`flex flex-col md:flex-row gap-6 p-6 rounded-xl ${cardBgColor} transition-all duration-300 relative z-10`}
                    >
                      <div className="md:w-1/3 lg:w-1/4 h-64 md:h-auto relative overflow-hidden rounded-lg">
                        <img
                          src={post.image_url}
                          alt="Production"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#061012] to-transparent">
                          <span className={`${accentColor} text-sm font-semibold`}>
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="md:w-2/3 lg:w-3/4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className={`${secondaryTextColor} text-sm`}>
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center space-x-2">
                              <img
                                src={post.user_image_url}
                                alt="Director"
                                className="w-8 h-8 rounded-full border border-[#FFD700]"
                              />
                              <span className={`text-sm ${textColor}`}>{post.user_name}</span>
                            </div>
                          </div>
                          
                          <h3 className={`text-2xl font-bold mb-3 ${textColor} group-hover:${accentColor} transition-colors`}>
                            {post.title}
                          </h3>
                          
                          <p className={`${secondaryTextColor} mb-6`}>
                            {post.content}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                          <div className="flex space-x-3">
                            <button
                              onClick={(e) => handleLike(post.id, e)}
                              disabled={loadingStates[post.id]}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                                post.isLiked 
                                  ? `${accentColor} bg-[#FFD70033]`
                                  : `${secondaryTextColor} ${theme === 'dark' ? 'bg-[#1E2D33]' : 'bg-[#E0E6EA]'} hover:bg-[#FFD70033]`
                              } ${loadingStates[post.id] ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <span>{post.isLiked ? '❤️' : '♡'}</span>
                              <span>{post.likes}</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(post.id);
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                                theme === 'dark' ? 'bg-[#1E2D33]' : 'bg-[#E0E6EA]'
                              } hover:bg-[#FFD70033] ${secondaryTextColor} hover:text-[#FFD700]`}
                            >
                              <span>💬</span>
                              <span>{post.comments_count}</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <SaveButton postId={post.id} />
                            <Link 
                              to={`/posts/${post.id}/comments`}
                              className={`px-4 py-2 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-[#1E2D33]' : 'bg-[#E0E6EA]'} ${accentColor} hover:bg-[#FFD70033] transition-colors`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Pagination Section */}
          {posts.length > 0 && (
            <div className={`py-12 px-4 md:px-28 border-t ${borderColor}`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className={`flex gap-x-2 items-center ${textColor} ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : `${goldHover}`
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Previous</span>
                </button>
                
                <div className="flex">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => {
                        setCurrentPage(index + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`text-sm font-medium px-4 py-2 mx-1 rounded-full ${
                        currentPage === index + 1
                          ? `${accentColor} ${accentBgColor}`
                          : `${textColor} ${theme === 'dark' ? 'bg-[#0E1A1F]' : 'bg-[#F8F9FA]'} hover:${accentBgColor}`
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className={`flex gap-x-2 items-center ${textColor} ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : `${goldHover}`
                  }`}
                >
                  <span className="text-sm font-medium">Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlogPage;




