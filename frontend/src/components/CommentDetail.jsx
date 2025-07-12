import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentList from "./CommentList";
import { useTheme } from "../ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const CommentDetail = () => {
  const { post_id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  // Theme-based colors
  const bgColor = theme === 'dark' ? 'bg-[#181818]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-[#7B7B7B]' : 'text-gray-600';
  const accentColor = theme === 'dark' ? 'text-[#91CC6E]' : 'text-green-600';
  const accentBgColor = theme === 'dark' ? 'bg-[#91CC6E33]' : 'bg-green-100';
  const cardBgColor = theme === 'dark' ? 'bg-[#282828]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  // Function to handle image URLs
  const getOptimizedImageUrl = (url) => {
    if (!url) return null;
    if (url.includes('default-post') || url.includes('noimage')) return null;
    if (url.includes('cloudinary.com')) {
      return url.includes('/upload/')
        ? url.replace('/upload/', '/upload/f_auto,q_auto,w_800/')
        : url;
    }
    return url;
  };

  useEffect(() => {
    if (!post_id) {
      setError("Post ID is undefined.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/posts/${post_id}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        const transformedPost = {
          ...data,
          user_image_url: data.author?.user_image || 'default-user-image-url.jpg',
          image_url: data.image_url || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg'
        };
        
        setPost(transformedPost);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [post_id]);

  if (loading) return <div className={`p-8 text-center ${secondaryTextColor}`}>Loading...</div>;
  if (error) return <div className={`p-8 text-center text-red-500`}>{error}</div>;
  if (!post) return <div className={`p-8 text-center ${secondaryTextColor}`}>Post not found</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`${bgColor} ${textColor} w-full mt-16 p-4 md:p-8`}>
          {/* Post Header */}
          <div className={`flex items-center p-4 ${cardBgColor} rounded-lg shadow-md mb-4`}>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {post.user_image_url ? (
                  <img
                    src={getOptimizedImageUrl(post.user_image_url) || 'default-user-image-url.jpg'}
                    alt={post.user_name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = 'default-user-image-url.jpg';
                    }}
                  />
                ) : (
                  post.user_name?.split(" ").map((chunk) => chunk[0]).join("")
                )}
              </div>
              <div className="grid gap-1">
                <div className={`font-semibold ${textColor}`}>{post.user_name}</div>
                <div className={`line-clamp-1 text-xs ${secondaryTextColor}`}>{post.title}</div>
                <div className={`line-clamp-1 text-xs ${secondaryTextColor}`}>
                  <span className={`font-medium ${accentColor}`}>Posted on:</span>{" "}
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Post Image */}
          {post.post_image && (
            <div className={`p-4 ${cardBgColor} rounded-lg shadow-md mb-4`}>
              <img
                src={post.post_image}
                alt="Post"
                className="w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
                }}
              />
            </div>
          )}

          {/* Post Content */}
          <div className={`flex-1 whitespace-pre-wrap p-6 ${cardBgColor} rounded-lg shadow-md mb-4 ${textColor}`}>
            {post.content}
          </div>

          {/* Comments Section */}
          <div className={`p-4 ${cardBgColor} rounded-lg shadow-md`}>
            <CommentList postId={post_id} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentDetail;