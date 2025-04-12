import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CommentList from "./CommentList";

const CommentDetail = () => {
  const { post_id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to handle image URLs (similar to BlogPage)
  const getOptimizedImageUrl = (url) => {
    if (!url) return null;
    
    // Skip default/placeholder images
    if (url.includes('default-post') || url.includes('noimage')) {
      return null;
    }
    
    // Apply Cloudinary transformations if it's a Cloudinary URL
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
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform data similar to BlogPage
        const transformedPost = {
          ...data,
          user_image_url: data.author?.user_image || 'default-user-image-url.jpg',
          post_image: data.image_url || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg'
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!post) return <div className="p-8 text-center text-gray-500">Post not found</div>;

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      <div className="flex items-center p-2">
        <div className="flex items-start gap-4 text-sm">
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
            <div className="font-semibold">{post.user_name}</div>
            <div className="line-clamp-1 text-xs">{post.title}</div>
            <div className="line-clamp-1 text-xs">
              <span className="font-medium">Posted on:</span>{" "}
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-px bg-gray-700"></div>
      <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
        {post.content}
      </div>
      
      {/* Enhanced Image Display with Cloudinary Optimization */}
      {getOptimizedImageUrl(post.post_image) && (
        <div className="p-4">
          <img
            src={getOptimizedImageUrl(post.post_image)}
            alt="Post"
            className="w-full max-h-96 object-contain rounded-lg"
            onError={(e) => {
              e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
              console.error('Failed to load image:', post.post_image);
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <CommentList postId={post_id} />
      </div>
    </div>
  );
};

export default CommentDetail;