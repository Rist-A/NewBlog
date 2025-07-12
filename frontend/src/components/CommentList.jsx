import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import back2 from "../Asset/back2.png";
import editt from "../Asset/editt.png";
import deletee from "../Asset/deletee.png";
import { useTheme } from "../ThemeContext";
import EmojiPicker from "emoji-picker-react"; // You'll need to install this package

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const emojiPickerRef = useRef(null);

  // Theme-based colors
  const bgColor = theme === 'dark' ? 'bg-[#181818]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = theme === 'dark' ? 'text-[#7B7B7B]' : 'text-gray-600';
  const accentColor = theme === 'dark' ? 'text-[#91CC6E]' : 'text-green-600';
  const accentBgColor = theme === 'dark' ? 'bg-[#91CC6E33]' : 'bg-green-100';
  const cardBgColor = theme === 'dark' ? 'bg-[#282828]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch comments with data transformation
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/posts/${postId}/comments`);
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        
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

  // Add emoji to comment
  const addEmoji = (emojiData) => {
    const emoji = emojiData.emoji;
    if (editingCommentId) {
      setEditedCommentContent(prev => prev + emoji);
    } else {
      setNewComment(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

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
    <div className={`max-w-xs ${cardBgColor} shadow-lg rounded-lg overflow-hidden flex flex-col mt-2`}>
      <button
        onClick={() => navigate(-1)}
        className={`p-2 ${accentBgColor} ${textColor} hover:bg-opacity-80 focus:outline-none flex items-center gap-2`}
      >
        <img src={back2} alt="Back" className="h-5 w-5" />
        <span>Back</span>
      </button>

      {error && (
        <div className={`p-2 ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} ${theme === 'dark' ? 'text-red-200' : 'text-red-700'} rounded-md mx-2 mt-1 text-sm`}>
          {error}
        </div>
      )}

      <ul className="flex-1 overflow-y-auto px-2 py-1 divide-y divide-gray-700 max-h-64">
        {comments.map((comment) => (
          <li key={comment.id} className="flex justify-between gap-x-2 py-2">
            <div className="flex min-w-0 gap-x-2">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {comment.user?.avatar_url ? (
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className={`text-gray-600 font-bold text-xs`}>
                    {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-auto">
                <p className={`text-xs font-semibold ${textColor}`}>
                  {comment.user?.username || 'Unknown User'}
                </p>
                {editingCommentId === comment.id ? (
                  <div className="relative">
                    <textarea
                      value={editedCommentContent}
                      onChange={(e) => setEditedCommentContent(e.target.value)}
                      className={`w-full p-1 text-xs border ${borderColor} rounded-md ${cardBgColor} ${textColor}`}
                      rows={2}
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-1 bottom-1 text-xs"
                    >
                      😊
                    </button>
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute right-0 bottom-8 z-10">
                        <EmojiPicker 
                          onEmojiClick={addEmoji} 
                          width={250}
                          height={300}
                          theme={theme === 'dark' ? 'dark' : 'light'}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={`mt-1 text-xs ${secondaryTextColor} break-words`}>
                    {comment.content}
                  </p>
                )}
                <p className={`text-[10px] ${secondaryTextColor}`}>
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {comment.user_id === sessionStorage.getItem("userId") && (
              <div className="flex items-center gap-1">
                {editingCommentId === comment.id ? (
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    className={`px-1 py-0.5 text-xs ${accentColor} ${theme === 'dark' ? 'bg-[#91CC6E33]' : 'bg-green-100'} rounded-md hover:opacity-80`}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditedCommentContent(comment.content);
                    }}
                    className="p-0.5 hover:opacity-70"
                  >
                    <img src={editt} alt="Edit" className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-0.5 hover:opacity-70"
                >
                  <img src={deletee} alt="Delete" className="h-4 w-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className={`p-2 border-t ${borderColor}`}>
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className={`w-full p-1 text-xs border ${borderColor} rounded-md ${cardBgColor} ${textColor}`}
            rows={2}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-1 bottom-1 text-s"
          >
            😊
          </button>
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute right-0 bottom-8 z-10">
              <EmojiPicker 
                onEmojiClick={addEmoji} 
                width={250}
                height={300}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleSubmitComment}
          className={`mt-1 w-full px-2 py-1 text-xs ${accentColor} ${theme === 'dark' ? 'bg-[#91CC6E33]' : 'bg-green-100'} rounded-md hover:opacity-80`}
        >
          Comment
        </button>
      </div>
    </div>
  );
};

export default CommentList;