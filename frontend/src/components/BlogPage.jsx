import React, { useEffect, useState } from "react";
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
  const [allPosts, setAllPosts] = useState([]); // Store all posts for filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [showCommentDetail, setShowCommentDetail] = useState(false);
  const [detailPostId, setDetailPostId] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const postsPerPage = 4;
  const navigate = useNavigate();
  const location = useLocation();

  // Theme-based colors
  const bgColor = theme === 'dark' ? 'bg-[#181818]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-[#7B7B7B]' : 'text-gray-600';
  const accentColor = theme === 'dark' ? 'text-[#91CC6E]' : 'text-green-600';
  const accentBgColor = theme === 'dark' ? 'bg-[#91CC6E33]' : 'bg-green-100';
  const cardBgColor = theme === 'dark' ? 'bg-[#282828]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const dropdownBgColor = theme === 'dark' ? 'bg-[#282828]' : 'bg-white';
  const dropdownHoverColor = theme === 'dark' ? 'hover:bg-[#383838]' : 'hover:bg-gray-100';

  // Hero section content
  const heroContent = [
    {
      title: "What's New?",
      subtitle: "Share Your Best Moment Here",
      buttonText: "Start Now",
      backgroundImage: "https://assets.vogue.com/photos/5f651e490f204e69b53eacbd/master/pass/VO080119_DESIGNERS_46.jpg",
    },
    {
      title: "Latest Trends",
      subtitle: "Discover the newest fashion trends",
      buttonText: "Explore Now",
      backgroundImage: "https://media.bleacherreport.com/image/upload/v1719242794/teiolpjmhprr7izmwo3f.jpg",
    },
    {
      title: "Men's Fashion",
      subtitle: "See the latest in men's style",
      buttonText: "View Collection",
      backgroundImage: "https://media.glamour.com/photos/66f5c2777e09bc43bcee2067/master/w_2560%2Cc_limit/men%25E2%2580%2599s%2520fashion%2520trends.jpg",
    }
  ];

  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [nextContentIndex, setNextContentIndex] = useState(1);
  const [textAnimation, setTextAnimation] = useState({
    fadeOut: false,
    slideDirection: 'up'
  });

  // Preload hero images
  useEffect(() => {
    heroContent.forEach(content => {
      const img = new Image();
      img.src = content.backgroundImage;
    });
  }, []);

  // Fetch all posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        
        // Fetch posts
        const postsResponse = await fetch("http://localhost:5000/posts", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!postsResponse.ok) throw new Error("Failed to fetch posts");
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
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  // Background image and text transition effect
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

  // Like handler
  const handleLike = async (postId) => {
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

  // Recent posts for the "Recent blog posts" section (always shows 3 most recent from all categories)
  const recentPosts = allPosts.slice(0, 3);
  
  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Handle comment click
  const handleCommentClick = (postId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    navigate(`/posts/${postId}/comments`);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`min-h-screen ${bgColor} ${textColor} w-full`}>
          {/* Mobile Menu Button (only visible on small screens) */}
          <div className="md:hidden fixed top-4 right-4 z-50">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu (slides in from right) */}
          {mobileMenuOpen && (
            <div 
              className={`fixed inset-0 z-40 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-6 transition-transform duration-300`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-end mb-8">
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X size={24} />
                  </button>
                </div>
                <nav className="flex flex-col gap-6 text-xl">
                  <Link to="/" className="hover:text-[#91CC6E]">Home</Link>
                  <Link to="/create" className="hover:text-[#91CC6E]">Create Post</Link>
                  <Link to="/profile" className="hover:text-[#91CC6E]">Profile</Link>
                  <Link to="/login" className="hover:text-[#91CC6E]">Login</Link>
                </nav>
              </div>
            </div>
          )}
          
          {/* Hero Section with Enhanced Transitions */}
          <div className="w-full h-screen relative overflow-hidden">
            {/* Background Image with Crossfade */}
            {heroContent.map((content, index) => (
              <div
                key={index}
                className="absolute inset-0 object-top w-full h-full transition-opacity duration-1000"
                style={{
                  backgroundImage: `url(${content.backgroundImage})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  opacity: currentBackgroundIndex === index ? 1 : 0,
                  zIndex: currentBackgroundIndex === index ? 1 : 0,
                }}
              />
            ))}
            
            {/* Content */}
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
              <div className="habesha-blog font-semibold text-[#91CC6E] text-lg mb-2">
                Our blog
              </div>
              <div className="text-5xl font-semibold mt-4 text-white">
                {heroContent[currentBackgroundIndex].title}
              </div>
              <div className="text-[20px] mt-4 text-[#c0c0c0]">
                {heroContent[currentBackgroundIndex].subtitle}
              </div>
              <div className="flex gap-x-4 mt-8 justify-center">
                <button
                  className={`w-[118px] h-12 bg-[#91CC6E] font-semibold flex items-center justify-center rounded-lg ${
                    textAnimation.fadeOut ? 'scale-90' : 'scale-100'
                  }`}
                  style={{ transition: "transform 300ms ease-in-out" }}
                  onClick={() => navigate("/login")}
                >
                  {heroContent[currentBackgroundIndex].buttonText}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Blog Posts Section */}
          <section className="py-12 px-4 md:px-28">
            <h2 className={`font-semibold text-2xl md:text-3xl mb-8 ${textColor}`}>
              Recent blog posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <article 
                  key={post.id} 
                  className={`rounded-lg overflow-hidden shadow-lg ${cardBgColor} transition-transform hover:scale-[1.02]`}
                >
                  <div className="w-full h-48 md:h-64 relative">
                    <img
                      src={post.image_url}
                      alt="Blog Post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className={`${accentColor} text-sm font-semibold`}>
                        {post.user_name} • {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <img
                        src={post.user_image_url}
                        alt="User Profile"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                        onError={(e) => {
                          e.target.src = "default-user-image-url.jpg";
                        }}
                      />
                    </div>
                    <h3 className={`text-xl md:text-2xl font-semibold mt-2 ${textColor}`}>
                      {post.title}
                    </h3>
                    <p className={`${secondaryTextColor} mt-2 line-clamp-3`}>
                      {post.content}
                    </p>
                    <div className="flex gap-x-2 mt-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        disabled={loadingStates[post.id]}
                        className={`${accentColor} ${accentBgColor} text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 ${
                          post.isLiked ? "opacity-80" : ""
                        } ${loadingStates[post.id] ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {post.isLiked ? '❤️' : '♡'} {post.likes}
                        {loadingStates[post.id] && <span className="ml-1">...</span>}
                      </button>
                      <button
                        onClick={() => handleCommentClick(post.id)}
                        className={`${accentColor} ${accentBgColor} text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer`}
                      >
                        <img src={comment} alt="Comment" className="w-3 h-3" />
                        <span className="ml-1">{post.comments_count}</span>
                      </button>
                      <SaveButton postId={post.id} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* All Blog Posts Section */}
          <section className="py-12 px-4 md:px-28">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className={`font-semibold text-2xl md:text-3xl ${textColor}`}>
                All Blog Posts
              </h2>
              
              {/* Modern Category Picker */}
              <div className="relative mt-4 md:mt-0">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`flex items-center justify-between w-full md:w-48 px-4 py-2 rounded-lg ${dropdownBgColor} border ${borderColor} shadow-sm ${textColor}`}
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
                  <div 
                    className={`absolute z-10 w-full md:w-48 mt-1 rounded-lg shadow-lg ${dropdownBgColor} border ${borderColor} max-h-60 overflow-auto`}
                    onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 ${selectedCategory === "All" ? accentBgColor : ''} ${dropdownHoverColor} ${textColor}`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.category_name);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 ${selectedCategory === category.category_name ? accentBgColor : ''} ${dropdownHoverColor} ${textColor}`}
                      >
                        {category.category_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {posts.length === 0 ? (
              <div className={`text-center py-12 ${secondaryTextColor}`}>
                No posts found in this category.
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                {currentPosts.map((post) => (
                  <article 
                    key={post.id} 
                    className={`flex flex-col md:flex-row gap-6 p-4 rounded-lg ${cardBgColor} shadow-md`}
                  >
                    <div className="md:w-1/4 flex flex-row md:flex-col items-start gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.user_image_url}
                          alt="User Profile"
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.target.src = "default-user-image-url.jpg";
                          }}
                        />
                        <div className="md:hidden">
                          <div className={`${accentColor} text-sm font-semibold`}>
                            {post.user_name}
                          </div>
                          <div className={`${secondaryTextColor} text-xs`}>
                            {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className={`${accentColor} text-sm font-semibold`}>
                          {post.user_name}
                        </div>
                        <div className={`${secondaryTextColor} text-sm`}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        <div className={`${accentColor} text-xs mt-1`}>
                          {post.category}
                        </div>
                      </div>
                    </div>

                    <div className="md:w-3/4">
                      <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
                        <img
                          src={post.image_url}
                          alt="Blog Post"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg";
                          }}
                        />
                      </div>
                      <h3 className={`text-xl md:text-2xl font-semibold mt-4 ${textColor}`}>
                        {post.title}
                      </h3>
                      <p className={`${secondaryTextColor} mt-2`}>
                        {post.content}
                      </p>
                      <div className="flex gap-x-2 mt-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          disabled={loadingStates[post.id]}
                          className={`${accentColor} ${accentBgColor} text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 ${
                            post.isLiked ? "opacity-80" : ""
                          } ${loadingStates[post.id] ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {post.isLiked ? '❤️' : '♡'} {post.likes}
                          {loadingStates[post.id] && <span className="ml-1">...</span>}
                        </button>
                        <button
                          onClick={() => handleCommentClick(post.id)}
                          className={`${accentColor} ${accentBgColor} text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer`}
                        >
                          <img src={comment} alt="Comment" className="w-3 h-3" />
                          <span className="ml-1">{post.comments_count}</span>
                        </button>
                        <SaveButton postId={post.id} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Pagination Section */}
          {posts.length > 0 && (
            <div className={`py-8 px-4 md:px-28 border-t ${borderColor}`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex gap-x-2 items-center ${textColor} ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:text-[#91CC6E]"
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Previous</span>
                </button>
                <div className="flex">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`text-sm font-medium px-3 py-1 mx-1 rounded ${
                        currentPage === index + 1
                          ? `${accentColor} ${accentBgColor}`
                          : `${textColor} hover:${accentBgColor}`
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex gap-x-2 items-center ${textColor} ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:text-[#91CC6E]"
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
//old 
// import React, { useEffect, useState } from "react";
// import { ArrowRight, ArrowLeft } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import CommentDetail from "./CommentDetail";
// import comment from "../Asset/comment.png";
// import SaveButton from "./SaveButton.jsx";

// const BlogPage = () => {
//   const [posts, setPosts] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showCommentDetail, setShowCommentDetail] = useState(false);
//   const [detailPostId, setDetailPostId] = useState(null);
//   const [loadingStates, setLoadingStates] = useState({});
//   const postsPerPage = 4;
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Hero section content
//   const heroContent = [
//     {
//       title: "What's New?",
//       subtitle: "Share Your Best Moment Here",
//       buttonText: "Start Now",
//       backgroundImage: "https://assets.vogue.com/photos/5f651e490f204e69b53eacbd/master/pass/VO080119_DESIGNERS_46.jpg"
//     },
//     {
//       title: "Latest Trends",
//       subtitle: "Discover the newest fashion trends",
//       buttonText: "Explore Now",
//       backgroundImage: "https://media.bleacherreport.com/image/upload/v1719242794/teiolpjmhprr7izmwo3f.jpg"
//     },
//     {
//       title: "Men's Fashion",
//       subtitle: "See the latest in men's style",
//       buttonText: "View Collection",
//       backgroundImage: "https://media.glamour.com/photos/66f5c2777e09bc43bcee2067/master/w_2560%2Cc_limit/men%25E2%2580%2599s%2520fashion%2520trends.jpg"
//     }
//   ];

//   const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
//   const [nextContentIndex, setNextContentIndex] = useState(1);
//   const [textAnimation, setTextAnimation] = useState({
//     fadeOut: false,
//     slideDirection: 'up'
//   });

//   // Fetch all posts
//   useEffect(() => {
//     const fetchPosts = async () => {
//       try {
//         const token = sessionStorage.getItem("token");
//         const postsResponse = await fetch("http://localhost:5000/posts", {
//           headers: token ? { Authorization: `Bearer ${token}` } : {}
//         });
        
//         if (!postsResponse.ok) throw new Error("Failed to fetch posts");
//         let postsData = await postsResponse.json();

//         // Transform the API response
//         postsData = postsData.map(post => ({
//           id: post.id,
//           title: post.title,
//           content: post.content,
//           image_url: post.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
//           created_at: post.createdAt,
//           updated_at: post.updatedAt,
//           user_name: post.author?.user_name || 'Anonymous',
//           user_image_url: post.author?.user_image || 'default-user-image-url.jpg',
//           likes: post.like_count || 0,
//           comments_count: post.comment_count || 0,
//           category: post.category?.category_name || 'Uncategorized',
//           isLiked: post.isLiked || false
//         }));

//         // Sort posts by creation date (newest first)
//         const sortedPosts = postsData.sort(
//           (a, b) => new Date(b.created_at) - new Date(a.created_at)
//         );
        
//         setPosts(sortedPosts);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
    
//     fetchPosts();
//   }, []);

//   // Background image and text transition effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       // Start fading out text with slide effect
//       setTextAnimation({
//         fadeOut: true,
//         slideDirection: 'up'
//       });
      
//       // Change background image after text starts fading
//       setTimeout(() => {
//         setCurrentBackgroundIndex(nextContentIndex);
//         setNextContentIndex((nextContentIndex + 1) % heroContent.length);
        
//         // Fade text back in with slide up effect
//         setTimeout(() => {
//           setTextAnimation({
//             fadeOut: false,
//             slideDirection: 'down'
//           });
//         }, 300);
//       }, 500);
//     }, 6000); // Total cycle time (6 seconds)

//     return () => clearInterval(interval);
//   }, [nextContentIndex]);

//   // Like handler
//   const handleLike = async (postId) => {
//     const token = sessionStorage.getItem("token");
//     if (!token) {
//       navigate("/login", { state: { from: location.pathname } });
//       return;
//     }

//     setLoadingStates(prev => ({ ...prev, [postId]: true }));

//     try {
//       // Optimistic update
//       setPosts(prevPosts =>
//         prevPosts.map(post => {
//           if (post.id === postId) {
//             const newLikeStatus = !post.isLiked;
//             return {
//               ...post,
//               isLiked: newLikeStatus,
//               likes: newLikeStatus ? post.likes + 1 : post.likes - 1
//             };
//           }
//           return post;
//         })
//       );

//       const response = await fetch(`http://localhost:5000/posts/${postId}/likes`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to update like status');
//       }

//       const data = await response.json();
      
//       // Final update with server data
//       setPosts(prevPosts =>
//         prevPosts.map(post => {
//           if (post.id === postId) {
//             return {
//               ...post,
//               isLiked: data.liked,
//               likes: data.likeCount
//             };
//           }
//           return post;
//         })
//       );
//     } catch (error) {
//       console.error('Error toggling like:', error);
//       // Revert optimistic update on error
//       setPosts(prevPosts =>
//         prevPosts.map(post => {
//           if (post.id === postId) {
//             return {
//               ...post,
//               isLiked: !post.isLiked,
//               likes: post.isLiked ? post.likes - 1 : post.likes + 1
//             };
//           }
//           return post;
//         })
//       );
//       alert('Failed to update like. Please try again.');
//     } finally {
//       setLoadingStates(prev => ({ ...prev, [postId]: false }));
//     }
//   };

//   // Recent posts for the "Recent blog posts" section
//   const recentPosts = posts.slice(0, 3);
  
//   // Pagination logic
//   const indexOfLastPost = currentPage * postsPerPage;
//   const indexOfFirstPost = indexOfLastPost - postsPerPage;
//   const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
//   const totalPages = Math.ceil(posts.length / postsPerPage);

//   // Handle comment click
//   const handleCommentClick = (postId) => {
//     const token = sessionStorage.getItem("token");
//     if (!token) {
//       navigate("/login", { state: { from: location.pathname } });
//       return;
//     }
//     navigate(`/posts/${postId}/comments`);
//   };

//   return (
//     <div className="h-full p-1 bg-[#181818] w-full">
//       {/* Hero Section with Enhanced Transitions */}
//       <div
//         className="w-full h-screen relative overflow-hidden"
//         style={{
//           backgroundImage: `url(${heroContent[currentBackgroundIndex].backgroundImage})`,
//           backgroundSize: "contain",
//           backgroundPosition: "center",
//           transition: "background-image 1s ease-in-out",
//         }}
//       >
//         <div 
//           className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 ${
//             textAnimation.fadeOut 
//               ? `opacity-0 ${textAnimation.slideDirection === 'up' ? 'translate-y-4' : '-translate-y-4'}`
//               : 'opacity-100 translate-y-0'
//           }`}
//         >
//           <div className="habesha-blog font-semibold text-[#91CC6E] text-lg mb-2 transition-all duration-300">
//             Our blog
//           </div>
//           <div className="text-5xl font-semibold mt-4 text-white transition-all duration-400">
//             {heroContent[currentBackgroundIndex].title}
//           </div>
//           <div className="text-[20px] mt-4 text-[#c0c0c0] transition-all duration-500">
//             {heroContent[currentBackgroundIndex].subtitle}
//           </div>
//           <div className="flex gap-x-4 mt-8 justify-center transition-all duration-600">
//             <button
//               className={`w-[118px] h-12 bg-[#91CC6E] font-semibold flex items-center justify-center rounded-lg transition-all duration-300 ${
//                 textAnimation.fadeOut ? 'scale-90' : 'scale-100'
//               }`}
//               onClick={() => navigate("/login")}
//             >
//               {heroContent[currentBackgroundIndex].buttonText}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Rest of your component remains the same */}
//       {/* Recent Blog Posts Section */}
//       <div className="font-semibold text-white text-[34px] ml-28 mt-12">
//         Recent blog posts
//       </div>
//       <div className="overflow-hidden w-full px-28 mt-8">
//         <div className="flex gap-8 animate-scroll">
//           {recentPosts.map((post) => (
//             <div key={post.id} className="flex-1 flex flex-col min-w-[300px]">
//               <div className="w-full h-64">
//                 <img
//                   src={post.image_url}
//                   alt="Blog Post"
//                   className="w-full h-full object-contain rounded-lg"
//                   onError={(e) => {
//                     e.target.src = "https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg";
//                   }}
//                 />
//               </div>
//               <div className="flex items-center justify-between mt-4">
//                 <div className="text-[#91CC6E] text-sm font-semibold">
//                   {post.user_name} - {new Date(post.created_at).toLocaleDateString()}
//                 </div>
//                 <img
//                   src={post.user_image_url}
//                   alt="User Profile"
//                   className="w-10 h-10 rounded-full"
//                   onError={(e) => {
//                     e.target.src = "default-user-image-url.jpg";
//                   }}
//                 />
//               </div>
//               <div className="text-white text-2xl font-semibold mt-2">
//                 {post.title}
//               </div>
//               <div className="text-[#7B7B7B] mt-2 line-clamp-3">
//                 {post.content}
//               </div>
//               <div className="flex gap-x-2 mt-4">
//                 <button
//                   onClick={() => handleLike(post.id)}
//                   disabled={loadingStates[post.id]}
//                   className={`text-[#91CC6E] bg-[#91CC6E33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 ${
//                     post.isLiked ? "bg-[#91CC6E66]" : ""
//                   } ${loadingStates[post.id] ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                 >
//                   {post.isLiked ? '❤️' : '♡'} {post.likes}
//                   {loadingStates[post.id] && <span className="ml-1">...</span>}
//                 </button>
//                 <div
//                   className="text-[#91CC6E] bg-[#91CC6E33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer"
//                   onClick={() => handleCommentClick(post.id)}
//                 >
//                   <img src={comment} alt="Comment" />
//                   <span className="ml-1">{post.comments_count}</span>
//                 </div>
//                 <SaveButton postId={post.id} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* All Blog Posts Section */}
//       <div className="font-semibold text-white text-[34px] ml-28 mt-24">
//         All Blog Post
//       </div>
//       <div className="flex flex-col gap-8 w-full px-28 mt-8">
//         {currentPosts.map((post) => (
//           <div key={post.id} className="flex gap-8">
//             <div className="w-64 flex flex-col items-start">
//               <img
//                 src={post.user_image_url}
//                 alt="User Profile"
//                 className="w-10 h-10 rounded-full"
//                 onError={(e) => {
//                   e.target.src = "default-user-image-url.jpg";
//                 }}
//               />
//               <div className="text-[#91CC6E] text-sm font-semibold mt-2">
//                 {post.user_name}
//               </div>
//               <div className="text-[#7B7B7B] text-sm">
//                 {new Date(post.created_at).toLocaleDateString()}
//               </div>
//               <div className="text-[#91CC6E] text-xs mt-1">
//                 {post.category}
//               </div>
//             </div>

//             <div className="flex-1">
//               <div className="w-full h-96">
//                 <img
//                   src={post.image_url}
//                   alt="Blog Post"
//                   className="w-full h-full object-cover rounded-lg"
//                   onError={(e) => {
//                     e.target.src = "https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg";
//                   }}
//                 />
//               </div>
//               <div className="text-white text-2xl font-semibold mt-4">
//                 {post.title}
//               </div>
//               <div className="text-[#7B7B7B] mt-2">
//                 {post.content}
//               </div>
//               <div className="flex gap-x-2 mt-4">
//                 <button
//                   onClick={() => handleLike(post.id)}
//                   disabled={loadingStates[post.id]}
//                   className={`text-[#91CC6E] bg-[#91CC6E33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 ${
//                     post.isLiked ? "bg-[#91CC6E66]" : ""
//                   } ${loadingStates[post.id] ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                 >
//                   {post.isLiked ? '❤️' : '♡'} {post.likes}
//                   {loadingStates[post.id] && <span className="ml-1">...</span>}
//                 </button>
//                 <div
//                   className="text-[#91CC6E] bg-[#91CC6E33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 cursor-pointer"
//                   onClick={() => handleCommentClick(post.id)}
//                 >
//                   <img src={comment} alt="Comment" />
//                   <span className="ml-1">{post.comments_count}</span>
//                 </div>
//                 <SaveButton postId={post.id} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Comment Detail Modal */}
//       {showCommentDetail && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-[#282828] rounded-lg p-6 w-1/2 max-h-[80vh] overflow-y-auto">
//             <button 
//               onClick={() => setShowCommentDetail(false)}
//               className="text-white float-right mb-4"
//             >
//               ×
//             </button>
//             <CommentDetail postId={detailPostId} />
//           </div>
//         </div>
//       )}

//       {/* Pagination Section */}
//       <div className="bg-white w-[1216px] h-px ml-28 mt-16" />
//       <div className="flex items-center justify-between h-fit w-auto mt-5 mx-28">
//         <button
//           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//           className={`flex gap-x-2 items-center ${
//             currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           <ArrowLeft className="text-white w-[22px] h-[22px]" />
//           <div className="text-white text-sm font-medium">Previous</div>
//         </button>
        
//         <div className="flex">
//           {Array.from({ length: totalPages }, (_, index) => (
//             <button
//               key={index + 1}
//               onClick={() => setCurrentPage(index + 1)}
//               className={`text-sm font-medium px-4 py-2 ${
//                 currentPage === index + 1
//                   ? "text-[#91CC6E] bg-[#91CC6E33]"
//                   : "text-white"
//               }`}
//             >
//               {index + 1}
//             </button>
//           ))}
//         </div>
        
//         <button
//           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//           disabled={currentPage === totalPages}
//           className={`flex gap-x-2 items-center ${
//             currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           <div className="text-white text-sm font-medium">Next</div>
//           <ArrowRight className="text-white w-[22px] h-[22px]" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BlogPage;