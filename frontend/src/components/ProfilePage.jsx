import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";// Import jwtDecode
import AuthorCard from "./AuthorCard"; // Import the AuthorCard component

const ProfilePage = () => {
  const [posts, setPosts] = useState([]); // State to store the logged-in user's posts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch the logged-in user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // Fetch the logged-in user's ID from the token
        const decodedToken = jwtDecode(token); // Use jwtDecode
        const userId = decodedToken.id;
        console.log("Logged-in User ID:", userId); // Debugging

        // Fetch posts created by the logged-in user
        const response = await axios.get(`http://localhost:5000/posts/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("User Posts API Response:", response.data); // Debugging
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching user posts:", error.response?.data || error.message); // Debugging
        setError("Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Post deleted successfully:", postId); // Debugging
      // Remove the deleted post from the state
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error.response?.data || error.message); // Debugging
      setError("Failed to delete post. Please try again later.");
    }
  };

  // Handle post editing (you can implement this as needed)
  const handleEditPost = (postId) => {
    console.log("Edit post:", postId); // Debugging
    // Redirect to an edit page or open a modal for editing
  };

  if (loading) {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-white text-center mt-8">{error}</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        {/* Author Card Section */}
        <div className="mt-12">
          <AuthorCard />
        </div>

        {/* User Posts Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:gap-8 mt-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="group relative flex h-48 items-end overflow-hidden rounded-lg bg-gray-800 shadow-lg md:h-64"
              >
                <img
                  src={post.image_url || "https://via.placeholder.com/600x400"} // Fallback image
                  loading="lazy"
                  alt={post.title}
                  className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-70"></div>

                <div className="relative ml-4 mb-3 inline-block text-sm text-white md:ml-5 md:text-lg">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-xs">{post.description}</p>
                </div>

                {/* Edit and Delete Buttons */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditPost(post.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white text-center col-span-full">No posts found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;