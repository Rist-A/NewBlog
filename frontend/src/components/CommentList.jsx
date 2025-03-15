import React, { useEffect, useState } from "react";

const CommentList = ({ postId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState({}); // Store user details separately
  const [newComment, setNewComment] = useState(""); // State for new comment input
  const [error, setError] = useState(null); // Handle errors

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/posts/${postId}/comments`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        setComments(data);

        // Fetch user details for each comment separately
        const userPromises = data.map((comment) => fetchUser(comment.author_id));
        const usersData = await Promise.all(userPromises);

        // Store user data in state
        const usersMap = {};
        usersData.forEach((user) => {
          if (user) usersMap[user.id] = user;
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [postId]);

  // Fetch user details
  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Extract capital letters for avatar fallback
  function extractCapitalLetters(inputString) {
    return inputString.replace(/[^A-Z]/g, "");
  }

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in to post a comment.");
        return;
      }

      const response = await fetch(`http://localhost:5000/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment.");
      }

      const newCommentData = await response.json();
      setComments([...comments, newCommentData]); // Update comments list
      setNewComment(""); // Clear input field
      setError(null); // Clear errors
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("Failed to submit comment. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white shadow-lg rounded-lg overflow-hidden flex flex-col mt-2">
      {/* Close Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mx-4 mt-2">
          {error}
        </div>
      )}

      {/* Comments List */}
<ul role="list" className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-gray-200">
  {comments.map((comment) => {
    // Find the user object from the users table where the id matches the comment's author_id
    const user = users.find(user => user.id === comment.author_id) || {};

    return (
      <li key={comment.id} className="flex justify-between gap-x-4 py-3">
        <div className="flex min-w-0 gap-x-3">
          {/* Avatar with fallback */}
          <div className="h-8 w-8 flex-none rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
            {user.image_url ? (
              <img
                src={user.image_url}
                alt={user.user_name || "User"}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
              />
            ) : (
              <span>{extractCapitalLetters(user.user_name || "U")}</span>
            )}
          </div>
          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold text-gray-900">{user.user_name || "Unknown User"}</p>
            <p className="mt-1 text-xs text-gray-500 break-words">{comment.content}</p>
          </div>
        </div>
      </li>
    );
  })}
</ul>
     

      {/* Input field and submit button for new comments */}
      <div className="p-4 border-t border-gray-200">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={2}
        />
        <button
          onClick={handleSubmitComment}
          className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CommentList;
