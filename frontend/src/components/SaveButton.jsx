import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bookmark } from 'lucide-react';

const SaveButton = ({ postId }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/posts/${postId}/saved-status`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        
        setIsSaved(response.data.isSaved);
      } catch (err) {
        console.error('Error checking saved status:', err);
        setError(err.response?.data?.error || 'Failed to check save status');
      } finally {
        setLoading(false);
      }
    };

    checkSavedStatus();
  }, [postId]);

  const handleSave = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Please login to save posts');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/save`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      setIsSaved(response.data.action === 'saved');
    } catch (err) {
      console.error('Error toggling save:', err);
      setError(err.response?.data?.error || 'Network error - please try again');
      
      // Additional error handling for specific cases
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server - please check your connection');
      } else if (err.response?.status === 401) {
        setError('session expired - please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleSave}
        disabled={loading}
        className={`text-[#B8FF8C] bg-[#B8FF8C33] text-sm font-medium flex justify-center items-center px-2.5 py-0.5 rounded-full h-6 ${
          isSaved ? "bg-[#B8FF8C66]" : ""
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#B8FF8C66]"}`}
        aria-label={isSaved ? 'Unsave post' : 'Save post'}
      >
        <Bookmark 
          size={16} 
          fill={isSaved ? "#B8FF8C" : "transparent"} 
          stroke="#B8FF8C" 
        />
        {loading && <span className="ml-1">...</span>}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 text-red-500 text-xs bg-white px-2 py-1 rounded shadow z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default SaveButton;