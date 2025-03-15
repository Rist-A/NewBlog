import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthorCard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode the JWT token to get the logged-in user's ID
  const token = localStorage.getItem("token");
  console.log("Token:", token); // Debugging

  useEffect(() => {
    if (!token) {
      console.error("No token found. Please log in.");
      setLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);
    console.log("Decoded Token:", decodedToken); // Debugging

    const userId = decodedToken.id;
    console.log("User ID:", userId); // Debugging

    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile API Response:", response.data); // Debugging
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  if (loading) {
    console.log("Loading state:", loading); // Debugging
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

  if (!user) {
    console.log("User state:", user); // Debugging
    return <div className="text-white text-center mt-8">User not found.</div>;
  }

  return (
    <div className="w-full flex items-center justify-center dark:bg-gray-900">
      <div className="relative w-full max-w-2xl my-8 md:my-16 flex flex-col items-start space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 px-4 py-8 border-2 border-dashed border-gray-400 dark:border-gray-400 shadow-lg rounded-lg">
        <span className="absolute text-xs font-medium top-0 left-0 rounded-br-lg rounded-tl-lg px-2 py-1 bg-primary-100 dark:bg-gray-900 dark:text-gray-300 border-gray-400 dark:border-gray-400 border-b-2 border-r-2 border-dashed ">
          author
        </span>

        <div className="w-full flex justify-center sm:justify-start sm:w-auto">
          <img
            className="object-cover w-20 h-20 mt-3 mr-3 rounded-full"
            src={user.image_url || "https://randomuser.me/api/portraits/men/32.jpg"}
            alt="Author"
          />
        </div>

        <div className="w-full sm:w-auto flex flex-col items-center sm:items-start">
          <p className="font-display mb-2 text-2xl font-semibold dark:text-gray-200">
            {user.user_name}
          </p>

          <div className="mb-4 md:text-lg text-gray-400">
            <p>{user.email}</p>
          </div>

          <div className="flex gap-4">
            <a
              href={`mailto:${user.email}`}
              className="text-indigo-500 hover:text-indigo-600"
            >
              My email: {user.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;