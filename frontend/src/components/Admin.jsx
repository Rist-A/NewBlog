import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Tab } from "@headlessui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import editt from "../Asset/editt.png";
import deletee from "../Asset/deletee.png";

// Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full border border-yellow-500">
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">{title}</h3>
        <p className="mb-4 text-gray-300">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ userRole, activeTab, setActiveTab }) => {
  return (
    <div className="p-4 border-r bg-gray-900 text-white h-full w-64 fixed">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-yellow-400">Habesha Blog</h1>
        <p className="text-sm text-gray-300">Admin Dashboard</p>
      </div>
      
      <div className="flex flex-col space-y-2 mb-4">
        <button
          className={`px-4 py-3 text-sm font-medium text-left rounded-lg transition-colors ${
            activeTab === "dashboard"
              ? "bg-yellow-500 text-gray-900 font-bold"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          📊 Dashboard Overview
        </button>
        
        {userRole === "admin" && (
          <>
            <button
              className={`px-4 py-3 text-sm font-medium text-left rounded-lg transition-colors ${
                activeTab === "category"
                  ? "bg-yellow-500 text-gray-900 font-bold"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              onClick={() => setActiveTab("category")}
            >
              📂 Manage Categories
            </button>
            
            <button
              className={`px-4 py-3 text-sm font-medium text-left rounded-lg transition-colors ${
                activeTab === "users"
                  ? "bg-yellow-500 text-gray-900 font-bold"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              onClick={() => setActiveTab("users")}
            >
              👥 Manage Users
            </button>

            <button
              className={`px-4 py-3 text-sm font-medium text-left rounded-lg transition-colors ${
                activeTab === "chat"
                  ? "bg-yellow-500 text-gray-900 font-bold"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              💬 Live Chat Support
            </button>
          </>
        )}
        
        <button
          className={`px-4 py-3 text-sm font-medium text-left rounded-lg transition-colors ${
            activeTab === "tag"
              ? "bg-yellow-500 text-gray-900 font-bold"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
          onClick={() => setActiveTab("tag")}
          disabled={userRole === "subadmin" && activeTab !== "tag"}
        >
          🏷️ Manage Tags
        </button>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Nael Production</p>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ stats }) => {
  const COLORS = ['#FFBB28', '#00C49F', '#0088FE', '#FF8042', '#8884D8'];
  
  const userRoleData = [
    { name: 'Admins', value: stats.userRoles.admin },
    { name: 'Subadmins', value: stats.userRoles.subadmin },
    { name: 'Users', value: stats.userRoles.user },
  ];
  
  const contentData = [
    { name: 'Categories', value: stats.categoryCount },
    { name: 'Tags', value: stats.tagCount },
    { name: 'Posts', value: stats.postCount },
  ];
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-gray-900 to-yellow-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-full mr-4">
              <span className="text-white text-xl">👥</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{stats.userCount}</p>
            </div>
          </div>
          <p className="text-sm opacity-80 mt-2">Registered in the system</p>
        </div>
        
        <div className="bg-gradient-to-r from-gray-900 to-blue-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-full mr-4">
              <span className="text-white text-xl">📝</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Posts</h3>
              <p className="text-3xl font-bold">{stats.postCount}</p>
            </div>
          </div>
          <p className="text-sm opacity-80 mt-2">Created content</p>
        </div>
        
        <div className="bg-gradient-to-r from-gray-900 to-green-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-full mr-4">
              <span className="text-white text-xl">📁</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Categories</h3>
              <p className="text-3xl font-bold">{stats.categoryCount}</p>
            </div>
          </div>
          <p className="text-sm opacity-80 mt-2">Content categories</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">User Roles Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    borderColor: '#4B5563',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#E5E7EB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">Content Statistics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis 
                  dataKey="name" 
                  stroke="#E5E7EB"
                />
                <YAxis 
                  stroke="#E5E7EB"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    borderColor: '#4B5563',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#E5E7EB' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#FFBB28" 
                  name="Count" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-yellow-400">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity, index) => (
            <div 
              key={index} 
              className="flex items-start p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="bg-yellow-500 text-gray-900 rounded-full p-3 mr-4">
                {activity.icon}
              </div>
              <div>
                <p className="font-medium text-white">{activity.title}</p>
                <p className="text-sm text-gray-300">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, onRoleUpdate }) => {
  const [editUserId, setEditUserId] = useState(null);
  const [newRole, setNewRole] = useState('');
  
  const handleRoleUpdate = (userId) => {
    if (!newRole) {
      toast.error("Please select a role");
      return;
    }
    onRoleUpdate(userId, newRole);
    setEditUserId(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">User List</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {editUserId === user.id ? (
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="border border-gray-600 bg-gray-700 text-white rounded p-1 focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="subadmin">Subadmin</option>
                        <option value="user">User</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-600 text-white' :
                        user.role === 'subadmin' ? 'bg-blue-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {editUserId === user.id ? (
                      <>
                        <button
                          onClick={() => handleRoleUpdate(user.id)}
                          className="mr-2 text-sm bg-yellow-600 hover:bg-yellow-500 text-white py-1 px-3 rounded transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditUserId(null)}
                          className="text-sm bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditUserId(user.id);
                          setNewRole(user.role);
                        }}
                        className="text-sm bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded transition-colors"
                      >
                        Edit Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Chat Component
const Chat = ({ conversationId, userId, senderType }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const socketUrl = 'http://localhost:5000';
    socketRef.current = io(socketUrl);
    
    // Join conversation room
    socketRef.current.emit('joinConversation', conversationId);
    
    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Load existing messages
    const loadMessages = async () => {
      try {
        const response = await fetch(`/chats`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      conversationId,
      content: newMessage,
      senderId: userId,
      senderType
    };
    
    // Send via WebSocket
    socketRef.current.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-900 rounded-t-xl">
        <h2 className="text-lg font-semibold text-yellow-400">Live Chat Support</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.senderType === senderType ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderType === senderType 
                  ? 'bg-yellow-600 text-white rounded-tr-none' 
                  : 'bg-gray-700 text-white rounded-tl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-gray-300 mt-1">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Chat Interface
const AdminChatInterface = ({ adminId }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    // Load active conversations
    const loadConversations = async () => {
      try {
        const response = await fetch('/api/chat/conversations?status=active');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
    
    // WebSocket connection
    const socketUrl = 'http://localhost:5000';
    socketRef.current = io(socketUrl);
    
    // Listen for new conversations
    socketRef.current.on('newConversation', (conversation) => {
      setConversations(prev => [...prev, conversation]);
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const assignToMe = async (conversationId) => {
    try {
      await fetch(`/chats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      });
      setActiveConversation(conversationId);
    } catch (error) {
      console.error('Error assigning conversation:', error);
    }
  };

  return (
    <div className="flex h-full gap-6">
      <div className="w-1/3 bg-gray-800 rounded-xl shadow border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-lg font-semibold text-yellow-400">Active Conversations</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                activeConversation === conv.id ? 'bg-gray-700' : ''
              }`}
              onClick={() => assignToMe(conv.id)}
            >
              <div className="flex items-center">
                <div className="bg-yellow-500 text-gray-900 rounded-full p-2 mr-3">
                  👤
                </div>
                <div>
                  <p className="font-medium text-white">{conv.user.username}</p>
                  <p className="text-sm text-gray-300 truncate">
                    {conv.messages[0]?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1">
        {activeConversation ? (
          <Chat 
            conversationId={activeConversation} 
            userId={adminId} 
            senderType="admin"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-gray-400">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Content Management Component (Categories/Tags)
const ContentManagement = ({ items, type, onCreate, onEdit, onDelete }) => {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (newName.length > 50) {
      toast.error("Name must be 50 characters or less");
      return;
    }
    onCreate(newName);
    setNewName("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditName(item.name || item.category_name || item.tag_name);
  };

  const confirmEdit = () => {
    setShowEditConfirm(false);
    onEdit(editId, editName);
    setEditId(null);
    setEditName("");
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <Tab.Group>
        <div className="flex items-center justify-between mb-6">
          <Tab.List className="flex space-x-4 bg-gray-700 p-1 rounded-lg">
            <Tab className="relative focus:outline-none">
              {({ selected }) => (
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selected
                      ? "bg-yellow-500 text-gray-900 font-bold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Create
                </button>
              )}
            </Tab>
            <Tab className="relative focus:outline-none">
              {({ selected }) => (
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selected
                      ? "bg-yellow-500 text-gray-900 font-bold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Edit
                </button>
              )}
            </Tab>
            <Tab className="relative focus:outline-none">
              {({ selected }) => (
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selected
                      ? "bg-yellow-500 text-gray-900 font-bold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Delete
                </button>
              )}
            </Tab>
          </Tab.List>
        </div>

        <Tab.Panels className="mt-4">
          {/* Create Panel */}
          <Tab.Panel>
            <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                Create {type === "category" ? "Category" : "Tag"}
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Enter ${type} name`}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                        className={`w-full p-3 border-2 ${
                          newName.length > 0 ? 'border-yellow-500' : 'border-gray-600'
                        } bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all`}
                        maxLength={50}
                      />
                      <div className="text-xs text-gray-400 text-right mt-1">
                        {newName.length}/50 characters
                      </div>
                    </div>
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className={`px-6 py-3 text-white rounded-lg transition-all ${
                        newName.trim()
                          ? 'bg-yellow-600 hover:bg-yellow-500'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      Create
                    </button>
                  </div>
                  
                  {showSuccess && (
                    <div className="flex items-center justify-center mt-4 animate-fade-in">
                      <div className="animate-bounce text-green-500 mr-2">✓</div>
                      <span className="text-green-500">
                        {type === 'category' ? 'Category' : 'Tag'} created successfully!
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-sm font-medium text-yellow-400 mb-2">Preview</h3>
                  <div className="flex items-center p-3 bg-gray-800 rounded">
                    {type === 'category' ? (
                      <span className="text-yellow-500 mr-2 text-xl">📁</span>
                    ) : (
                      <span className="text-yellow-500 mr-2 text-xl">🏷️</span>
                    )}
                    <span className="font-medium text-white">
                      {newName || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Quick suggestions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {type === 'category' ? (
                      <>
                        <button onClick={() => setNewName('Technology')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Technology</button>
                        <button onClick={() => setNewName('Design')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Design</button>
                        <button onClick={() => setNewName('Business')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Business</button>
                        <button onClick={() => setNewName('Marketing')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Marketing</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setNewName('Trending')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Trending</button>
                        <button onClick={() => setNewName('Featured')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Featured</button>
                        <button onClick={() => setNewName('Popular')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">Popular</button>
                        <button onClick={() => setNewName('New')} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors">New</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Edit Panel */}
          <Tab.Panel>
            <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                Edit {type === "category" ? "Categories" : "Tags"}
              </h2>
              {items.length === 0 ? (
                <p className="text-gray-400">No {type}s available</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li 
                      key={item.id} 
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {editId === item.id ? (
                        <div className="flex items-center gap-3 w-full">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 p-2 border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                          <button
                            onClick={() => setShowEditConfirm(true)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditName("");
                            }}
                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-white">{item.name || item.category_name || item.tag_name}</span>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded hover:bg-gray-500 transition-colors"
                          >
                            <img src={editt} alt="Edit" className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Tab.Panel>

          {/* Delete Panel */}
          <Tab.Panel>
            <div className="bg-gray-800 p-6 rounded-xl shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-yellow-400">
                Delete {type === "category" ? "Categories" : "Tags"}
              </h2>
              {items.length === 0 ? (
                <p className="text-gray-400">No {type}s available</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li 
                      key={item.id} 
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <span className="font-medium text-white">{item.name || item.category_name || item.tag_name}</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded hover:bg-gray-500 transition-colors"
                      >
                        <img src={deletee} alt="Delete" className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={`Delete ${type === "category" ? "Category" : "Tag"}`}
        message={`Are you sure you want to delete this ${type}? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showEditConfirm}
        onClose={() => setShowEditConfirm(false)}
        onConfirm={confirmEdit}
        title={`Update ${type === "category" ? "Category" : "Tag"}`}
        message={`Are you sure you want to update this ${type}?`}
      />
    </div>
  );
};

// Main Admin Component
const Admin = () => {
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    userCount: 0,
    postCount: 0,
    categoryCount: 0,
    tagCount: 0,
    userRoles: {
      admin: 0,
      subadmin: 0,
      user: 0
    },
    recentActivity: []
  });
  const navigate = useNavigate();

  // Initialize toast notifications
  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Check authentication and role
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);

      if (!['admin', 'subadmin'].includes(decoded.role)) {
        navigate("/");
      } else if (decoded.role === "subadmin") {
        setActiveTab("tag");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        
        // Always fetch dashboard stats
        const statsResponse = await fetch("http://localhost:5000/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
        
        // Fetch users if on users tab and admin
        if (activeTab === "users" && userRole === "admin") {
          const usersResponse = await fetch("http://localhost:5000/users", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData);
          }
        }
        
        // Fetch categories or tags
        if (activeTab === "category" || activeTab === "tag") {
          const endpoint = activeTab === "category" ? "/categories" : "/tags";
          const response = await fetch(`http://localhost:5000${endpoint}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error("Failed to fetch data");
          const data = await response.json();
          
          if (activeTab === "category") {
            setCategories(data);
          } else {
            setTags(data);
          }
        }
      } catch (error) {
        showError(`Error fetching ${activeTab} data: ${error.message}`);
      }
    };

    fetchData();
  }, [activeTab, userRole]);

  // Handle create operation
  const handleCreate = async (type, name) => {
    try {
      const token = sessionStorage.getItem("token");
      const endpoint = type === "category" ? "/categories" : "/tags";
      const requestBody = type === "category" 
        ? { category_name: name } 
        : { tag_name: name };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create");
      }
      
      const data = await response.json();
      
      if (type === "category") {
        setCategories([...categories, data]);
        setStats(prev => ({
          ...prev,
          categoryCount: prev.categoryCount + 1,
          recentActivity: [{
            icon: '📁',
            title: 'New Category Added',
            description: `Category "${data.category_name}" was created`,
            time: 'Just now'
          }, ...prev.recentActivity.slice(0, 4)]
        }));
      } else {
        setTags([...tags, data]);
        setStats(prev => ({
          ...prev,
          tagCount: prev.tagCount + 1,
          recentActivity: [{
            icon: '🏷️',
            title: 'New Tag Added',
            description: `Tag "${data.tag_name}" was created`,
            time: 'Just now'
          }, ...prev.recentActivity.slice(0, 4)]
        }));
      }
      
      showSuccess(`${type === "category" ? "Category" : "Tag"} created successfully!`);
    } catch (error) {
      showError(`Error creating ${type}: ${error.message}`);
    }
  };

  // Handle edit operation
  const handleEdit = async (type, id, name) => {
    try {
      const token = sessionStorage.getItem("token");
      const endpoint = type === "category"
        ? `/categories/${id}`
        : `/tags/${id}`;

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(type === "category" 
          ? { category_name: name }
          : { tag_name: name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update");
      }
      
      const data = await response.json();
      
      if (type === "category") {
        setCategories(categories.map((cat) => (cat.id === id ? data : cat)));
        setStats(prev => ({
          ...prev,
          recentActivity: [{
            icon: '✏️',
            title: 'Category Updated',
            description: `Category was renamed to "${data.category_name}"`,
            time: 'Just now'
          }, ...prev.recentActivity.slice(0, 4)]
        }));
      } else {
        setTags(tags.map((tag) => (tag.id === id ? data : tag)));
        setStats(prev => ({
          ...prev,
          recentActivity: [{
            icon: '✏️',
            title: 'Tag Updated',
            description: `Tag was renamed to "${data.tag_name}"`,
            time: 'Just now'
          }, ...prev.recentActivity.slice(0, 4)]
        }));
      }
      
      showSuccess(`${type === "category" ? "Category" : "Tag"} updated successfully!`);
    } catch (error) {
      showError(`Error updating ${type}: ${error.message}`);
    }
  };

  // Handle delete operation
  const handleDelete = async (type, id) => {
    try {
      const token = sessionStorage.getItem("token");
      const endpoint = type === "category"
        ? `/categories/${id}`
        : `/tags/${id}`;

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete");
      }
      
      if (type === "category") {
        const deletedCategory = categories.find(cat => cat.id === id);
        setCategories(categories.filter((cat) => cat.id !== id));
        setStats(prev => ({
          ...prev,
          categoryCount: prev.categoryCount - 1,
          recentActivity: [{
            icon: '🗑️',
            title: 'Category Deleted',
            description: `Category "${deletedCategory.category_name}" was removed`,
            time: 'Just now'
          }, ...prev.recentActivity.slice(0, 4)]
        }));
      } else {
        const deletedTag = tags.find(tag => tag.id === id);
        setTags(tags.filter((tag) => tag.id !== id));
        setStats(prev => ({
          ...prev,
          tagCount: prev.tagCount - 1,
          recentActivity: [{
            icon: '🗑️',
            title: 'Tag Deleted',
            description: `Tag "${deletedTag.tag_name}" was removed`,
            time: 'Just now'
          }, ...prev.recentActivity.slice(0, 4)]
        }));
      }
      
      showSuccess(`${type === "category" ? "Category" : "Tag"} deleted successfully!`);
    } catch (error) {
      showError(`Error deleting ${type}: ${error.message}`);
    }
  };

  // Handle user role update
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/users/${userId}/role`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update role");
      }
      
      const updatedUser = await response.json();
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      
      // Update stats
      const roleCounts = { admin: 0, subadmin: 0, user: 0 };
      users.forEach(user => {
        if (user.id === userId) {
          roleCounts[newRole]++;
        } else {
          roleCounts[user.role]++;
        }
      });
      
      setStats(prev => ({
        ...prev,
        userRoles: roleCounts,
        recentActivity: [{
          icon: '👤',
          title: 'User Role Changed',
          description: `${updatedUser.username}'s role changed to ${newRole}`,
          time: 'Just now'
        }, ...prev.recentActivity.slice(0, 4)]
      }));
      
      showSuccess("User role updated successfully!");
    } catch (error) {
      showError(`Error updating user role: ${error.message}`);
    }
  };

  if (!userRole) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray mt-16">
      <Sidebar 
        userRole={userRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div className="flex-1 overflow-auto p-6 ml-64">
        <div className="max-w-6xl mx-auto pt-6">
          {/* Welcome Banner */}
          {activeTab === "dashboard" && (
            <div className="bg-gradient-to-r from-gray-800 to-yellow-700 text-white p-8 rounded-xl mb-8 shadow-lg border border-gray-700">
              <h1 className="text-3xl font-bold mb-2">Welcome to Nael Production Admin</h1>
              <p className="text-lg opacity-90">
                Manage your content, users, and analyze platform performance with our comprehensive dashboard.
              </p>
            </div>
          )}
          
          {/* Dashboard Content */}
          {activeTab === "dashboard" && <DashboardOverview stats={stats} />}
          
          {/* User Management */}
          {activeTab === "users" && userRole === "admin" && (
            <UserManagement users={users} onRoleUpdate={handleRoleUpdate} />
          )}
          
          {/* Category Management */}
          {activeTab === "category" && (
            <ContentManagement
              items={categories}
              type="category"
              onCreate={(name) => handleCreate("category", name)}
              onEdit={(id, name) => handleEdit("category", id, name)}
              onDelete={(id) => handleDelete("category", id)}
            />
          )}
          
          {/* Tag Management */}
          {activeTab === "tag" && (
            <ContentManagement
              items={tags}
              type="tag"
              onCreate={(name) => handleCreate("tag", name)}
              onEdit={(id, name) => handleEdit("tag", id, name)}
              onDelete={(id) => handleDelete("tag", id)}
            />
          )}
          
          {/* Admin Chat Interface */}
          {activeTab === "chat" && userRole === "admin" && (
            <AdminChatInterface adminId={sessionStorage.getItem("userId")} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

