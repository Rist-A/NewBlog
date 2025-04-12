import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import back2 from "../Asset/back2.png";
import editt from "../Asset/editt.png";
import deletee from "../Asset/deletee.png";

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const navigate = useNavigate();

  // Fetch comments with data transformation
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/posts/${postId}/comments`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        
        // Transform data to match frontend expectations
        const transformedComments = data.map(comment => ({
          ...comment,
          user: {
            id: comment.author?.id,
            username: comment.author?.user_name,
            avatar_url: comment.author?.user_image,
          },
          user_id: comment.author?.id
        }));
        
        setComments(transformedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments");
      }
    };

    fetchComments();
  }, [postId]);

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/posts/${postId}` } });
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post comment");
      }

      const newCommentData = await response.json();
      
      // Transform the new comment to match structure
      const transformedComment = {
        ...newCommentData,
        user: {
          id: newCommentData.author?.id,
          username: newCommentData.author?.user_name,
          avatar_url: newCommentData.author?.user_image,
        },
        user_id: newCommentData.author?.id
      };
      
      setComments(prev => [transformedComment, ...prev]);
      setNewComment("");
      setError(null);
    } catch (error) {
      console.error("Error posting comment:", error);
      setError(error.message);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/posts/${postId}` } });
        return;
      }

      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editedCommentContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update comment");
      }

      const updatedComment = await response.json();
      
      // Transform the updated comment
      const transformedComment = {
        ...updatedComment,
        user: {
          id: updatedComment.author?.id,
          username: updatedComment.author?.user_name,
          avatar_url: updatedComment.author?.user_image,
        },
        user_id: updatedComment.author?.id
      };
      
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId ? transformedComment : comment
        )
      );
      setEditingCommentId(null);
      setError(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      setError(error.message);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login", { state: { from: `/posts/${postId}` } });
        return;
      }

      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete comment");
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setError(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError(error.message);
    }
  };

  return (
    <div className="w-full bg-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col mt-2">
      <button
        onClick={() => navigate(-1)}
        className="p-2 bg-gray-700 text-white hover:bg-gray-600 focus:outline-none"
      >
        <img src={back2} alt="Back" className="h-6 w-6" />
      </button>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md mx-4 mt-2">
          {error}
        </div>
      )}

      <ul className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-gray-700">
        {comments.map((comment) => (
          <li key={comment.id} className="flex justify-between gap-x-4 py-3">
            <div className="flex min-w-0 gap-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {comment.user?.avatar_url ? (
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-bold text-sm">
                    {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold text-white">
                  {comment.user?.username || 'Unknown User'}
                </p>
                {editingCommentId === comment.id ? (
                  <textarea
                    value={editedCommentContent}
                    onChange={(e) => setEditedCommentContent(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-xs text-gray-300 break-words">
                    {comment.content}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {comment.user_id === sessionStorage.getItem("userId") && (
              <div className="flex items-center gap-2">
                {editingCommentId === comment.id ? (
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditedCommentContent(comment.content);
                    }}
                    className="p-1"
                  >
                    <img src={editt} alt="Edit" className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1"
                >
                  <img src={deletee} alt="Delete" className="h-5 w-5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-700">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
          rows={2}
        />
        <button
          onClick={handleSubmitComment}
          className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CommentList;