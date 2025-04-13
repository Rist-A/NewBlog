"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit, Camera, Check, X, Trash2 } from "lucide-react";
import { ChevronUp, ChevronDown } from 'react-feather';
import back2 from "../Asset/back2.png";
import { toast } from 'sonner';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [fontSize, setFontSize] = useState('medium');
  const navigate = useNavigate();

  // Font size mapping
  const fontSizeMap = {
    small: {
      base: 'text-sm',
      heading: 'text-xl md:text-2xl',
      title: 'text-lg',
      subtitle: 'text-xs',
      button: 'text-sm',
    },
    medium: {
      base: 'text-base',
      heading: 'text-2xl md:text-3xl',
      title: 'text-xl',
      subtitle: 'text-sm',
      button: 'text-base',
    },
    large: {
      base: 'text-lg',
      heading: 'text-3xl md:text-4xl',
      title: 'text-2xl',
      subtitle: 'text-base',
      button: 'text-lg',
    },
  };

  // Fetch profile data with proper image processing
  const fetchProfile = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/profile", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Process the data to ensure proper image URLs
      const processedData = {
        ...response.data,
        user: {
          ...response.data.user,
          user_image: response.data.user.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'
        },
        posts: response.data.posts.map(post => ({
          ...post,
          image_url: post.image_url || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
          author: {
            ...post.author,
            user_image: post.author.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'
          }
        })),
        savedPosts: response.data.savedPosts.map(saved => ({
          ...saved,
          post: {
            ...saved.post,
            image_url: saved.post.image_url || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
            author: {
              ...saved.post.author,
              user_image: saved.post.author.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'
            }
          }
        }))
      };

      setProfileData(processedData);
      setFormData(prev => ({
        ...prev,
        username: processedData.user.user_name
      }));
    } catch (err) {
      console.error("Error fetching profile:", err);
      
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        navigate('/login');
        toast.error("Session expired", {
          description: "Please login again"
        });
      } else {
        setError(err.response?.data?.error || "Failed to load profile");
        toast.error("Error loading profile", {
          description: err.response?.data?.error || "Please try again later"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  const handleDeletePost = async (postId) => {
    const toastId = toast.loading("Deleting post...");
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:5000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Post deleted", {
        description: "Your post has been successfully deleted",
        id: toastId
      });
      
      await fetchProfile();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting post", {
        description: err.response?.data?.error || "Please try again",
        id: toastId
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating profile...");
    
    // Password change validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      toast.error("Password mismatch", {
        description: "New passwords don't match",
        id: toastId
      });
      return;
    }

    // Check if any changes were made
    const usernameChanged = formData.username !== profileData.user.user_name;
    const passwordChanged = formData.newPassword && formData.currentPassword;
    const imageChanged = formData.image !== null;

    if (!usernameChanged && !passwordChanged && !imageChanged) {
      setEditMode(false);
      toast("No changes detected", {
        description: "Your profile remains unchanged",
        id: toastId
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const formDataToSend = new FormData();
      if (usernameChanged) {
        formDataToSend.append('user_name', formData.username);
      }
      
      if (passwordChanged) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }
      
      if (imageChanged) {
        if (!formData.image.type.startsWith('image/')) {
          setError("Please select a valid image file");
          toast.error("Invalid image", {
            description: "Please select a valid image file",
            id: toastId
          });
          return;
        }
        if (formData.image.size > 5 * 1024 * 1024) {
          setError("Image size must be less than 5MB");
          toast.error("Image too large", {
            description: "Image size must be less than 5MB",
            id: toastId
          });
          return;
        }
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.put(
        'http://localhost:5000/users/update', 
        formDataToSend, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local state and reset form
      await fetchProfile();
      
      setEditMode(false);
      setPreviewImage(null);
      setFormData({
        username: response.data.user.user_name,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        image: null
      });
      setError(null);
      setShowPasswordFields(false);

      toast.success("Profile updated", {
        description: "Your profile has been successfully updated",
        id: toastId
      });
    } catch (err) {
      console.error('Profile update error:', err);
      
      let errorMessage = "An unexpected error occurred";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else {
          errorMessage = err.response.data?.error || "Failed to update profile";
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error("Update failed", {
        description: errorMessage,
        id: toastId
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (error && !profileData) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="text-red-500 text-lg">{error}</div>
    </div>
  );

  if (!profileData) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="text-white">No profile data found</div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-900 text-white p-4 md:p-8 ${fontSizeMap[fontSize].base}`}>
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:text-green-400 transition-colors"
        >
          <img src={back2} alt="Back" className="w-6 h-6" />
          <span className={fontSizeMap[fontSize].button}>Back</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className={fontSizeMap[fontSize].subtitle}>Font Size:</span>
          <div className="flex gap-1">
            {['small', 'medium', 'large'].map(size => (
              <button 
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 rounded ${fontSize === size ? 'bg-green-500' : 'bg-gray-700'} ${fontSizeMap[fontSize].button}`}
              >
                {size.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-6 mb-8 shadow-lg relative transition-all duration-300 hover:shadow-2xl">
        {editMode && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={handleSubmit}
              className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-md"
              title="Save Changes"
            >
              <Check size={20} />
            </button>
            <button 
              onClick={() => {
                setEditMode(false);
                setPreviewImage(null);
                setShowPasswordFields(false);
                setFormData({
                  username: profileData.user.user_name,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                  image: null
                });
                setError(null);
              }}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-md"
              title="Cancel"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <img 
              src={previewImage || profileData.user.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'} 
              alt="Profile"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-green-500 transition-all duration-300 group-hover:border-green-400"
              onError={(e) => {
                e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
              }}
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition-colors shadow-md">
                <Camera size={18} />
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          
          <div className="text-center md:text-left">
            {editMode ? (
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`bg-gray-700 text-white ${fontSizeMap[fontSize].heading} font-bold p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            ) : (
              <h1 className={`${fontSizeMap[fontSize].heading} font-bold`}>{profileData.user.user_name}</h1>
            )}
            
            <p className={`text-gray-400 ${fontSizeMap[fontSize].subtitle}`}>{profileData.user.email}</p>
            
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <div className={`bg-gray-700 px-4 py-2 rounded-lg ${fontSizeMap[fontSize].button} hover:bg-gray-600 transition-colors`}>
                <span className="font-bold">{profileData.posts.length}</span> Posts
              </div>
              <div className={`bg-gray-700 px-4 py-2 rounded-lg ${fontSizeMap[fontSize].button} hover:bg-gray-600 transition-colors`}>
                <span className="font-bold">{profileData.savedPosts.length}</span> Saved
              </div>
            </div>
            
            {!editMode && (
              <button 
                onClick={() => setEditMode(true)}
                className={`mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors ${fontSizeMap[fontSize].button} shadow-md`}
              >
                <Edit size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {editMode && (
          <div className="mt-6">
            <button 
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
            >
              {showPasswordFields ? (
                <>
                  <ChevronUp size={16} />
                  <span>Hide Password Change</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>Change Password</span>
                </>
              )}
            </button>

            {showPasswordFields && (
              <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
                <div>
                  <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>
                    Current Password (required for password change)
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${fontSizeMap[fontSize].subtitle}`}
                    placeholder="Enter current password to change password"
                  />
                </div>
                
                <div>
                  <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${fontSizeMap[fontSize].subtitle}`}
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${fontSizeMap[fontSize].subtitle}`}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            )}
            
            {error && (
              <div className={`text-red-500 mt-2 ${fontSizeMap[fontSize].subtitle}`}>{error}</div>
            )}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto mb-6 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-4 font-medium ${activeTab === 'posts' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'} ${fontSizeMap[fontSize].button} transition-colors`}
          >
            Your Posts
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2 px-4 font-medium ${activeTab === 'saved' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'} ${fontSizeMap[fontSize].button} transition-colors`}
          >
            Saved Posts
          </button>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData.posts.length > 0 ? (
              profileData.posts.map(post => (
                <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img
                    src={post.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg'}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
                    }}
                  />
                  <div className="p-4">
                    <h3 className={`font-bold mb-2 ${fontSizeMap[fontSize].title} group-hover:text-green-400 transition-colors`}>{post.title}</h3>
                    <p className={`text-gray-400 line-clamp-2 mb-4 ${fontSizeMap[fontSize].subtitle}`}>{post.content}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-gray-500 ${fontSizeMap[fontSize].subtitle}`}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/editpost/${post.id}`)}
                          className="text-gray-400 hover:text-green-400 transition-colors p-1 rounded-full hover:bg-gray-700"
                          title="Edit Post"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-700"
                          title="Delete Post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-full text-center py-12 text-gray-400 ${fontSizeMap[fontSize].title}`}>
                You haven't created any posts yet
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData.savedPosts.length > 0 ? (
              profileData.savedPosts.map(saved => (
                <div key={saved.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img
                    src={saved.post.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg'}
                    alt={saved.post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
                    }}
                  />
                  <div className="p-4">
                    <h3 className={`font-bold mb-2 ${fontSizeMap[fontSize].title} group-hover:text-green-400 transition-colors`}>{saved.post.title}</h3>
                    <p className={`text-gray-400 line-clamp-2 mb-4 ${fontSizeMap[fontSize].subtitle}`}>{saved.post.content}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img 
                          src={saved.post.author.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'} 
                          alt={saved.post.author.user_name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
                          }}
                        />
                        <span className={`text-gray-400 ${fontSizeMap[fontSize].subtitle}`}>
                          {saved.post.author.user_name}
                        </span>
                      </div>
                      <span className={`text-gray-500 ${fontSizeMap[fontSize].subtitle}`}>
                        Saved on {new Date(saved.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`col-span-full text-center py-12 text-gray-400 ${fontSizeMap[fontSize].title}`}>
                You haven't saved any posts yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;


// "use client"

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Edit, Camera, Check, X, Trash2 } from "lucide-react";
// import { ChevronUp, ChevronDown } from 'react-feather';
// import back2 from "../Asset/back2.png";
// import { toast } from 'sonner';

// const ProfilePage = () => {
//   const [profileData, setProfileData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('posts');
//   const [editMode, setEditMode] = useState(false);
//   const [showPasswordFields, setShowPasswordFields] = useState(false);
//   const [formData, setFormData] = useState({
//     username: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//     image: null
//   });
//   const [previewImage, setPreviewImage] = useState(null);
//   const [fontSize, setFontSize] = useState('medium');
//   const navigate = useNavigate();

//   // Font size mapping
//   const fontSizeMap = {
//     small: {
//       base: 'text-sm',
//       heading: 'text-xl md:text-2xl',
//       title: 'text-lg',
//       subtitle: 'text-xs',
//       button: 'text-sm',
//     },
//     medium: {
//       base: 'text-base',
//       heading: 'text-2xl md:text-3xl',
//       title: 'text-xl',
//       subtitle: 'text-sm',
//       button: 'text-base',
//     },
//     large: {
//       base: 'text-lg',
//       heading: 'text-3xl md:text-4xl',
//       title: 'text-2xl',
//       subtitle: 'text-base',
//       button: 'text-lg',
//     },
//   };

//   // Fetch profile data
//   const fetchProfile = async () => {
//     const token = sessionStorage.getItem("token");
//     if (!token) {
//       navigate('/login');
//       return;
//     }

//     try {
//       const response = await axios.get("http://localhost:5000/profile", {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       setProfileData(response.data);
//       setFormData(prev => ({
//         ...prev,
//         username: response.data.user.user_name
//       }));
//     } catch (err) {
//       console.error("Error fetching profile:", err);
      
//       if (err.response?.status === 401) {
//         sessionStorage.removeItem("token");
//         navigate('/login');
//         toast.error("Session expired", {
//           description: "Please login again"
//         });
//       } else {
//         setError(err.response?.data?.error || "Failed to load profile");
//         toast.error("Error loading profile", {
//           description: err.response?.data?.error || "Please try again later"
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const handleDeletePost = async (postId) => {
//     const toastId = toast.loading("Deleting post...");
//     try {
//       const token = sessionStorage.getItem("token");
//       await axios.delete(`http://localhost:5000/posts/${postId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       toast.success("Post deleted", {
//         description: "Your post has been successfully deleted",
//         id: toastId
//       });
      
//       await fetchProfile();
//     } catch (err) {
//       console.error("Delete error:", err);
//       toast.error("Error deleting post", {
//         description: err.response?.data?.error || "Please try again",
//         id: toastId
//       });
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData(prev => ({
//         ...prev,
//         image: file
//       }));
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const toastId = toast.loading("Updating profile...");
    
//     // Password change validation
//     if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
//       setError("New passwords don't match");
//       toast.error("Password mismatch", {
//         description: "New passwords don't match",
//         id: toastId
//       });
//       return;
//     }

//     // Check if any changes were made
//     const usernameChanged = formData.username !== profileData.user.user_name;
//     const passwordChanged = formData.newPassword && formData.currentPassword;
//     const imageChanged = formData.image !== null;

//     if (!usernameChanged && !passwordChanged && !imageChanged) {
//       setEditMode(false);
//       toast("No changes detected", {
//         description: "Your profile remains unchanged",
//         id: toastId
//       });
//       return;
//     }

//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) {
//         setError("Authentication required. Please login again.");
//         return;
//       }

//       const formDataToSend = new FormData();
//       if (usernameChanged) {
//         formDataToSend.append('user_name', formData.username);
//       }
      
//       if (passwordChanged) {
//         formDataToSend.append('currentPassword', formData.currentPassword);
//         formDataToSend.append('newPassword', formData.newPassword);
//       }
      
//       if (imageChanged) {
//         if (!formData.image.type.startsWith('image/')) {
//           setError("Please select a valid image file");
//           toast.error("Invalid image", {
//             description: "Please select a valid image file",
//             id: toastId
//           });
//           return;
//         }
//         if (formData.image.size > 5 * 1024 * 1024) {
//           setError("Image size must be less than 5MB");
//           toast.error("Image too large", {
//             description: "Image size must be less than 5MB",
//             id: toastId
//           });
//           return;
//         }
//         formDataToSend.append('image', formData.image);
//       }

//       const response = await axios.put(
//         'http://localhost:5000/users/update', 
//         formDataToSend, 
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       // Update local state and reset form
//       await fetchProfile();
      
//       setEditMode(false);
//       setPreviewImage(null);
//       setFormData({
//         username: response.data.user.user_name,
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//         image: null
//       });
//       setError(null);
//       setShowPasswordFields(false);

//       toast.success("Profile updated", {
//         description: "Your profile has been successfully updated",
//         id: toastId
//       });
//     } catch (err) {
//       console.error('Profile update error:', err);
      
//       let errorMessage = "An unexpected error occurred";
//       if (err.response) {
//         if (err.response.status === 401) {
//           errorMessage = "Session expired. Please login again.";
//         } else {
//           errorMessage = err.response.data?.error || "Failed to update profile";
//         }
//       } else if (err.request) {
//         errorMessage = "Network error. Please check your connection.";
//       }

//       toast.error("Update failed", {
//         description: errorMessage,
//         id: toastId
//       });
//     }
//   };

//   if (loading) return (
//     <div className="flex justify-center items-center h-screen bg-gray-900">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//     </div>
//   );

//   if (error && !profileData) return (
//     <div className="flex justify-center items-center h-screen bg-gray-900">
//       <div className="text-red-500 text-lg">{error}</div>
//     </div>
//   );

//   if (!profileData) return (
//     <div className="flex justify-center items-center h-screen bg-gray-900">
//       <div className="text-white">No profile data found</div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen bg-gray-900 text-white p-4 md:p-8 ${fontSizeMap[fontSize].base}`}>
//       {/* Header Section */}
//       <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
//         <button 
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 hover:text-green-400 transition-colors"
//         >
//           <img src={back2} alt="Back" className="w-6 h-6" />
//           <span className={fontSizeMap[fontSize].button}>Back</span>
//         </button>
        
//         <div className="flex items-center gap-2">
//           <span className={fontSizeMap[fontSize].subtitle}>Font Size:</span>
//           <div className="flex gap-1">
//             {['small', 'medium', 'large'].map(size => (
//               <button 
//                 key={size}
//                 onClick={() => setFontSize(size)}
//                 className={`px-2 py-1 rounded ${fontSize === size ? 'bg-green-500' : 'bg-gray-700'} ${fontSizeMap[fontSize].button}`}
//               >
//                 {size.charAt(0).toUpperCase()}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Profile Section */}
//       <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-6 mb-8 shadow-lg relative transition-all duration-300 hover:shadow-2xl">
//         {editMode && (
//           <div className="absolute top-4 right-4 flex gap-2">
//             <button 
//               onClick={handleSubmit}
//               className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-md"
//               title="Save Changes"
//             >
//               <Check size={20} />
//             </button>
//             <button 
//               onClick={() => {
//                 setEditMode(false);
//                 setPreviewImage(null);
//                 setShowPasswordFields(false);
//                 setFormData({
//                   username: profileData.user.user_name,
//                   currentPassword: '',
//                   newPassword: '',
//                   confirmPassword: '',
//                   image: null
//                 });
//                 setError(null);
//               }}
//               className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-md"
//               title="Cancel"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         )}
        
//         <div className="flex flex-col md:flex-row items-center gap-6">
//           <div className="relative group">
//             <img 
//               src={previewImage || profileData.user.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'} 
//               alt="Profile"
//               className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-green-500 transition-all duration-300 group-hover:border-green-400"
//               onError={(e) => {
//                 e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
//               }}
//             />
//             {editMode && (
//               <label className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition-colors shadow-md">
//                 <Camera size={18} />
//                 <input 
//                   type="file" 
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleImageChange}
//                 />
//               </label>
//             )}
//           </div>
          
//           <div className="text-center md:text-left">
//             {editMode ? (
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 className={`bg-gray-700 text-white ${fontSizeMap[fontSize].heading} font-bold p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500`}
//               />
//             ) : (
//               <h1 className={`${fontSizeMap[fontSize].heading} font-bold`}>{profileData.user.user_name}</h1>
//             )}
            
//             <p className={`text-gray-400 ${fontSizeMap[fontSize].subtitle}`}>{profileData.user.email}</p>
            
//             <div className="flex gap-4 mt-4 justify-center md:justify-start">
//               <div className={`bg-gray-700 px-4 py-2 rounded-lg ${fontSizeMap[fontSize].button} hover:bg-gray-600 transition-colors`}>
//                 <span className="font-bold">{profileData.posts.length}</span> Posts
//               </div>
//               <div className={`bg-gray-700 px-4 py-2 rounded-lg ${fontSizeMap[fontSize].button} hover:bg-gray-600 transition-colors`}>
//                 <span className="font-bold">{profileData.savedPosts.length}</span> Saved
//               </div>
//             </div>
            
//             {!editMode && (
//               <button 
//                 onClick={() => setEditMode(true)}
//                 className={`mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors ${fontSizeMap[fontSize].button} shadow-md`}
//               >
//                 <Edit size={18} />
//                 Edit Profile
//               </button>
//             )}
//           </div>
//         </div>

//         {editMode && (
//           <div className="mt-6">
//             <button 
//               onClick={() => setShowPasswordFields(!showPasswordFields)}
//               className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
//             >
//               {showPasswordFields ? (
//                 <>
//                   <ChevronUp size={16} />
//                   <span>Hide Password Change</span>
//                 </>
//               ) : (
//                 <>
//                   <ChevronDown size={16} />
//                   <span>Change Password</span>
//                 </>
//               )}
//             </button>

//             {showPasswordFields && (
//               <div className="space-y-4 bg-gray-700 p-4 rounded-lg">
//                 <div>
//                   <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>
//                     Current Password (required for password change)
//                   </label>
//                   <input
//                     type="password"
//                     name="currentPassword"
//                     value={formData.currentPassword}
//                     onChange={handleInputChange}
//                     className={`w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${fontSizeMap[fontSize].subtitle}`}
//                     placeholder="Enter current password to change password"
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>New Password</label>
//                   <input
//                     type="password"
//                     name="newPassword"
//                     value={formData.newPassword}
//                     onChange={handleInputChange}
//                     className={`w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${fontSizeMap[fontSize].subtitle}`}
//                     placeholder="Enter new password"
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>Confirm New Password</label>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleInputChange}
//                     className={`w-full bg-gray-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 ${fontSizeMap[fontSize].subtitle}`}
//                     placeholder="Confirm new password"
//                   />
//                 </div>
//               </div>
//             )}
            
//             {error && (
//               <div className={`text-red-500 mt-2 ${fontSizeMap[fontSize].subtitle}`}>{error}</div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Content Tabs */}
//       <div className="max-w-4xl mx-auto mb-6 border-b border-gray-700">
//         <div className="flex space-x-4">
//           <button
//             onClick={() => setActiveTab('posts')}
//             className={`py-2 px-4 font-medium ${activeTab === 'posts' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'} ${fontSizeMap[fontSize].button} transition-colors`}
//           >
//             Your Posts
//           </button>
//           <button
//             onClick={() => setActiveTab('saved')}
//             className={`py-2 px-4 font-medium ${activeTab === 'saved' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'} ${fontSizeMap[fontSize].button} transition-colors`}
//           >
//             Saved Posts
//           </button>
//         </div>
//       </div>

//       {/* Posts Section */}
//       <div className="max-w-4xl mx-auto">
//         {activeTab === 'posts' ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {profileData.posts.length > 0 ? (
//               profileData.posts.map(post => (
//                 <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
//                   <img
//                     src={post.image_url || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg'}
//                     alt={post.title}
//                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//                     onError={(e) => {
//                       e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
//                     }}
//                   />
//                   <div className="p-4">
//                     <h3 className={`font-bold mb-2 ${fontSizeMap[fontSize].title} group-hover:text-green-400 transition-colors`}>{post.title}</h3>
//                     <p className={`text-gray-400 line-clamp-2 mb-4 ${fontSizeMap[fontSize].subtitle}`}>{post.content}</p>
//                     <div className="flex justify-between items-center">
//                       <span className={`text-gray-500 ${fontSizeMap[fontSize].subtitle}`}>
//                         {new Date(post.createdAt).toLocaleDateString()}
//                       </span>
//                       <div className="flex gap-2">
//                         <button 
//                           onClick={() => navigate(`/editpost/${post.id}`)}
//                           className="text-gray-400 hover:text-green-400 transition-colors p-1 rounded-full hover:bg-gray-700"
//                           title="Edit Post"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button 
//                           onClick={() => handleDeletePost(post.id)}
//                           className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-700"
//                           title="Delete Post"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className={`col-span-full text-center py-12 text-gray-400 ${fontSizeMap[fontSize].title}`}>
//                 You haven't created any posts yet
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {profileData.savedPosts.length > 0 ? (
//               profileData.savedPosts.map(saved => (
//                 <div key={saved.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
//                   <img
//                     src={saved.post.image_url || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg'}
//                     alt={saved.post.title}
//                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//                     onError={(e) => {
//                       e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
//                     }}
//                   />
//                   <div className="p-4">
//                     <h3 className={`font-bold mb-2 ${fontSizeMap[fontSize].title} group-hover:text-green-400 transition-colors`}>{saved.post.title}</h3>
//                     <p className={`text-gray-400 line-clamp-2 mb-4 ${fontSizeMap[fontSize].subtitle}`}>{saved.post.content}</p>
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <img 
//                           src={saved.post.author.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'} 
//                           alt={saved.post.author.user_name}
//                           className="w-6 h-6 rounded-full object-cover"
//                           onError={(e) => {
//                             e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
//                           }}
//                         />
//                         <span className={`text-gray-400 ${fontSizeMap[fontSize].subtitle}`}>
//                           {saved.post.author.user_name}
//                         </span>
//                       </div>
//                       <span className={`text-gray-500 ${fontSizeMap[fontSize].subtitle}`}>
//                         Saved on {new Date(saved.createdAt).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className={`col-span-full text-center py-12 text-gray-400 ${fontSizeMap[fontSize].title}`}>
//                 You haven't saved any posts yet
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

//old

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Edit, Camera, Check, X, Bookmark, Trash2 } from "lucide-react";
// import back2 from "../Asset/back2.png";

// const ProfilePage = () => {
//   const [profileData, setProfileData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('posts');
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState({
//     username: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//     image: null
//   });
//   const [previewImage, setPreviewImage] = useState(null);
//   const [fontSize, setFontSize] = useState('medium');
//   const navigate = useNavigate();

//   // Font size mapping
//   const fontSizeMap = {
//     small: {
//       base: 'text-sm',
//       heading: 'text-xl md:text-2xl',
//       title: 'text-lg',
//       subtitle: 'text-xs',
//       button: 'text-sm',
//     },
//     medium: {
//       base: 'text-base',
//       heading: 'text-2xl md:text-3xl',
//       title: 'text-xl',
//       subtitle: 'text-sm',
//       button: 'text-base',
//     },
//     large: {
//       base: 'text-lg',
//       heading: 'text-3xl md:text-4xl',
//       title: 'text-2xl',
//       subtitle: 'text-base',
//       button: 'text-lg',
//     },
//   };

//   // Fetch profile data
//   useEffect(() => {
//     const fetchProfile = async () => {
//       const token = sessionStorage.getItem("token");
//       if (!token) {
//         setError("Please login to view your profile");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get("http://localhost:5000/profile", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setProfileData(response.data);
//         setFormData(prev => ({
//           ...prev,
//           username: response.data.user.user_name
//         }));
//       } catch (err) {
//         console.error("Profile fetch error:", err);
//         setError(err.response?.data?.error || "Failed to load profile");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleDeletePost = async (postId) => {
//     if (!window.confirm("Are you sure you want to delete this post?")) return;
    
//     try {
//       await axios.delete(`http://localhost:5000/posts/${postId}`, {
//         headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
//       });
//       setProfileData(prev => ({
//         ...prev,
//         posts: prev.posts.filter(post => post.id !== postId)
//       }));
//     } catch (err) {
//       console.error("Delete error:", err);
//       setError("Failed to delete post");
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData(prev => ({
//         ...prev,
//         image: file
//       }));
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate password match if new password is provided
//     if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
//       setError("New passwords don't match");
//       return;
//     }
  
//     try {
//       const token = sessionStorage.getItem("token");
//       if (!token) {
//         setError("Authentication required. Please login again.");
//         return;
//       }
  
//       // Create FormData object
//       const formDataToSend = new FormData();
      
//       // Add all form fields
//       formDataToSend.append('user_name', formData.username);
      
//       // Only append password fields if they're being changed
//       if (formData.currentPassword && formData.newPassword) {
//         formDataToSend.append('currentPassword', formData.currentPassword);
//         formDataToSend.append('newPassword', formData.newPassword);
//       }
      
//       // Add image if provided
//       if (formData.image) {
//         // Validate image file
//         if (!formData.image.type.startsWith('image/')) {
//           setError("Please select a valid image file");
//           return;
//         }
//         if (formData.image.size > 5 * 1024 * 1024) {
//           setError("Image size must be less than 5MB");
//           return;
//         }
//         formDataToSend.append('image', formData.image);
//       }
  
//       // Make the API request
//       const response = await axios.put(
//         'http://localhost:5000/users/update', 
//         formDataToSend, 
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );
  
//       // Update local state with new user data
//       setProfileData(prev => ({
//         ...prev,
//         user: {
//           ...prev.user,
//           user_name: response.data.user.user_name,
//           user_image: response.data.user.user_image || prev.user.user_image
//         }
//       }));
      
//       // Reset form state
//       setEditMode(false);
//       setPreviewImage(null);
//       setFormData({
//         username: response.data.user.user_name,
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//         image: null
//       });
//       setError(null);
  
//     } catch (err) {
//       console.error('Profile update error:', {
//         message: err.message,
//         response: err.response?.data
//       });
      
//       // Handle different error scenarios
//       if (err.response) {
//         if (err.response.status === 401) {
//           setError("Session expired. Please login again.");
//         } else if (err.response.data?.error) {
//           setError(err.response.data.error);
//         } else {
//           setError("Failed to update profile. Please try again.");
//         }
//       } else if (err.request) {
//         setError("Network error. Please check your connection.");
//       } else {
//         setError("An unexpected error occurred.");
//       }
//     }
//   };
//   if (loading) return (
//     <div className="flex justify-center items-center h-screen bg-gray-900">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//     </div>
//   );

//   if (error && !profileData) return (
//     <div className="flex justify-center items-center h-screen bg-gray-900">
//       <div className="text-red-500 text-lg">{error}</div>
//     </div>
//   );

//   if (!profileData) return (
//     <div className="flex justify-center items-center h-screen bg-gray-900">
//       <div className="text-white">No profile data found</div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen bg-gray-900 text-white p-4 md:p-8 ${fontSizeMap[fontSize].base}`}>
//       {/* Back Button and Font Size Controls */}
//       <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
//         <button 
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 hover:text-green-400 transition-colors"
//         >
//           <img src={back2} alt="Back" className="w-6 h-6" />
//           <span className={fontSizeMap[fontSize].button}>Back</span>
//         </button>
        
//         <div className="flex items-center gap-2">
//           <span className={fontSizeMap[fontSize].subtitle}>Font Size:</span>
//           <div className="flex gap-1">
//             <button 
//               onClick={() => setFontSize('small')}
//               className={`px-2 py-1 rounded ${fontSize === 'small' ? 'bg-green-500' : 'bg-gray-700'} ${fontSizeMap[fontSize].button}`}
//             >
//               S
//             </button>
//             <button 
//               onClick={() => setFontSize('medium')}
//               className={`px-2 py-1 rounded ${fontSize === 'medium' ? 'bg-green-500' : 'bg-gray-700'} ${fontSizeMap[fontSize].button}`}
//             >
//               M
//             </button>
//             <button 
//               onClick={() => setFontSize('large')}
//               className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-green-500' : 'bg-gray-700'} ${fontSizeMap[fontSize].button}`}
//             >
//               L
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Profile Header */}
//       <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-6 mb-8 shadow-lg relative">
//         {editMode && (
//           <div className="absolute top-4 right-4 flex gap-2">
//             <button 
//               onClick={handleSubmit}
//               className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors"
//               title="Save Changes"
//             >
//               <Check size={20} />
//             </button>
//             <button 
//               onClick={() => {
//                 setEditMode(false);
//                 setPreviewImage(null);
//                 setFormData({
//                   username: profileData.user.user_name,
//                   currentPassword: '',
//                   newPassword: '',
//                   confirmPassword: '',
//                   image: null
//                 });
//                 setError(null);
//               }}
//               className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
//               title="Cancel"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         )}
        
//         <div className="flex flex-col md:flex-row items-center gap-6">
//           <div className="relative">
//             <img 
//               src={previewImage || profileData.user.user_image} 
//               alt="Profile"
//               className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-green-500"
//               onError={(e) => {
//                 e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
//               }}
//             />
//             {editMode && (
//               <label className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition-colors">
//                 <Camera size={18} />
//                 <input 
//                   type="file" 
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleImageChange}
//                 />
//               </label>
//             )}
//           </div>
          
//           <div className="text-center md:text-left">
//             {editMode ? (
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 className={`bg-gray-700 text-white ${fontSizeMap[fontSize].heading} font-bold p-2 rounded w-full`}
//               />
//             ) : (
//               <h1 className={`${fontSizeMap[fontSize].heading} font-bold`}>{profileData.user.user_name}</h1>
//             )}
            
//             <p className={`text-gray-400 ${fontSizeMap[fontSize].subtitle}`}>{profileData.user.email}</p>
            
//             <div className="flex gap-4 mt-4 justify-center md:justify-start">
//               <div className={`bg-gray-700 px-4 py-2 rounded-lg ${fontSizeMap[fontSize].button}`}>
//                 <span className="font-bold">{profileData.posts.length}</span> Posts
//               </div>
//               <div className={`bg-gray-700 px-4 py-2 rounded-lg ${fontSizeMap[fontSize].button}`}>
//                 <span className="font-bold">{profileData.savedPosts.length}</span> Saved
//               </div>
//             </div>
            
//             {!editMode && (
//               <button 
//                 onClick={() => setEditMode(true)}
//                 className={`mt-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors ${fontSizeMap[fontSize].button}`}
//               >
//                 <Edit size={18} />
//                 Edit Profile
//               </button>
//             )}
//           </div>
//         </div>

//         {editMode && (
//           <div className="mt-6 space-y-4">
//             <div>
//               <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>
//                 Current Password (required for password change)
//               </label>
//               <input
//                 type="password"
//                 name="currentPassword"
//                 value={formData.currentPassword}
//                 onChange={handleInputChange}
//                 className={`w-full bg-gray-700 text-white p-2 rounded ${fontSizeMap[fontSize].subtitle}`}
//                 placeholder="Enter current password to change password"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>New Password</label>
//               <input
//                 type="password"
//                 name="newPassword"
//                 value={formData.newPassword}
//                 onChange={handleInputChange}
//                 className={`w-full bg-gray-700 text-white p-2 rounded ${fontSizeMap[fontSize].subtitle}`}
//                 placeholder="Enter new password"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-gray-400 mb-1 ${fontSizeMap[fontSize].subtitle}`}>Confirm New Password</label>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className={`w-full bg-gray-700 text-white p-2 rounded ${fontSizeMap[fontSize].subtitle}`}
//                 placeholder="Confirm new password"
//               />
//             </div>
            
//             {error && (
//               <div className={`text-red-500 mt-2 ${fontSizeMap[fontSize].subtitle}`}>{error}</div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Content Tabs */}
//       <div className="max-w-4xl mx-auto mb-6 border-b border-gray-700">
//         <div className="flex space-x-4">
//           <button
//             onClick={() => setActiveTab('posts')}
//             className={`py-2 px-4 font-medium ${activeTab === 'posts' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'} ${fontSizeMap[fontSize].button}`}
//           >
//             Your Posts
//           </button>
//           <button
//             onClick={() => setActiveTab('saved')}
//             className={`py-2 px-4 font-medium ${activeTab === 'saved' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'} ${fontSizeMap[fontSize].button}`}
//           >
//             Saved Posts
//           </button>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="max-w-4xl mx-auto">
//         {activeTab === 'posts' ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {profileData.posts.length > 0 ? (
//               profileData.posts.map(post => (
//                 <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
//                   <img
//                     src={post.image_url}
//                     alt={post.title}
//                     className="w-full h-48 object-cover"
//                     onError={(e) => {
//                       e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
//                     }}
//                   />
//                   <div className="p-4">
//                     <h3 className={`font-bold mb-2 ${fontSizeMap[fontSize].title}`}>{post.title}</h3>
//                     <p className={`text-gray-400 line-clamp-2 mb-4 ${fontSizeMap[fontSize].subtitle}`}>{post.content}</p>
//                     <div className="flex justify-between items-center">
//                       <span className={`text-gray-500 ${fontSizeMap[fontSize].subtitle}`}>
//                         {new Date(post.createdAt).toLocaleDateString()}
//                       </span>
//                       <div className="flex gap-2">
//                         <button 
//                           onClick={() => navigate(`/edit-post/${post.id}`)}
//                           className="text-gray-400 hover:text-green-400 transition-colors"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button 
//                           onClick={() => handleDeletePost(post.id)}
//                           className="text-gray-400 hover:text-red-400 transition-colors"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className={`col-span-full text-center py-12 text-gray-400 ${fontSizeMap[fontSize].title}`}>
//                 You haven't created any posts yet
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {profileData.savedPosts.length > 0 ? (
//               profileData.savedPosts.map(saved => (
//                 <div key={saved.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
//                   <img
//                     src={saved.post.image_url}
//                     alt={saved.post.title}
//                     className="w-full h-48 object-cover"
//                     onError={(e) => {
//                       e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
//                     }}
//                   />
//                   <div className="p-4">
//                     <h3 className={`font-bold mb-2 ${fontSizeMap[fontSize].title}`}>{saved.post.title}</h3>
//                     <p className={`text-gray-400 line-clamp-2 mb-4 ${fontSizeMap[fontSize].subtitle}`}>{saved.post.content}</p>
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <img 
//                           src={saved.post.author.user_image} 
//                           alt={saved.post.author.user_name}
//                           className="w-6 h-6 rounded-full object-cover"
//                           onError={(e) => {
//                             e.target.src = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
//                           }}
//                         />
//                         <span className={`text-gray-400 ${fontSizeMap[fontSize].subtitle}`}>
//                           {saved.post.author.user_name}
//                         </span>
//                       </div>
//                       <span className={`text-gray-500 ${fontSizeMap[fontSize].subtitle}`}>
//                         Saved on {new Date(saved.createdAt).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className={`col-span-full text-center py-12 text-gray-400 ${fontSizeMap[fontSize].title}`}>
//                 You haven't saved any posts yet
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;