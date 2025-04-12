import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Tab } from "@headlessui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
    <div className="p-4 border-r bg-gray-100 h-full w-64">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Admin Panel</h2>
      <div className="flex flex-col space-y-2 mb-4">
        {userRole === "admin" && (
          <button
            className={`px-4 py-2 text-sm font-medium text-left border rounded ${
              activeTab === "category" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
            onClick={() => setActiveTab("category")}
          >
            Manage Categories
          </button>
        )}
        <button
          className={`px-4 py-2 text-sm font-medium text-left border rounded ${
            activeTab === "tag" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
          }`}
          onClick={() => setActiveTab("tag")}
          disabled={userRole === "subadmin" && activeTab !== "tag"}
        >
          Manage Tags
        </button>
      </div>
    </div>
  );
};

// Main Admin Component
const Admin = () => {
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("category");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
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
      } catch (error) {
        showError(`Error fetching ${activeTab}s: ${error.message}`);
      }
    };
    
    fetchData();
  }, [activeTab]);

  // Handle create operation
  const handleCreate = async () => {
    if (!newName.trim()) {
      showError("Name cannot be empty");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const endpoint = activeTab === "category" ? "/categories" : "/tags";
      const requestBody = activeTab === "category" 
        ? { category_name: newName } 
        : { tag_name: newName };
      
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
      
      if (activeTab === "category") {
        setCategories([...categories, data]);
      } else {
        setTags([...tags, data]);
      }
      
      setNewName("");
      showSuccess(`${activeTab === "category" ? "Category" : "Tag"} created successfully!`);
    } catch (error) {
      showError(`Error creating ${activeTab}: ${error.message}`);
    }
  };

  // Handle edit confirmation
  const confirmEdit = async () => {
    setShowEditConfirm(false);
    try {
      const token = sessionStorage.getItem("token");
      const endpoint = activeTab === "category" 
        ? `/categories/${editId}` 
        : `/tags/${editId}`;
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(activeTab === "category" 
          ? { category_name: editName }
          : { tag_name: editName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update");
      }
      
      const data = await response.json();
      
      if (activeTab === "category") {
        setCategories(categories.map((cat) => (cat.id === editId ? data : cat)));
      } else {
        setTags(tags.map((tag) => (tag.id === editId ? data : tag)));
      }
      
      setEditId(null);
      setEditName("");
      showSuccess(`${activeTab === "category" ? "Category" : "Tag"} updated successfully!`);
    } catch (error) {
      showError(`Error updating ${activeTab}: ${error.message}`);
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = sessionStorage.getItem("token");
      const endpoint = activeTab === "category" 
        ? `/categories/${deleteId}` 
        : `/tags/${deleteId}`;
      
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
      
      if (activeTab === "category") {
        setCategories(categories.filter((cat) => cat.id !== deleteId));
      } else {
        setTags(tags.filter((tag) => tag.id !== deleteId));
      }
      
      showSuccess(`${activeTab === "category" ? "Category" : "Tag"} deleted successfully!`);
    } catch (error) {
      showError(`Error deleting ${activeTab}: ${error.message}`);
    }
  };

  if (!userRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        userRole={userRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {activeTab === "category" ? "Manage Categories" : "Manage Tags"}
          </h1>
          
          <Tab.Group>
            <div className="flex items-center justify-between mb-6">
              <Tab.List className="flex space-x-4 bg-gray-100 p-1 rounded-lg">
                <Tab className="relative focus:outline-none">
                  {({ selected }) => (
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        selected
                          ? "bg-white shadow text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Create
                    </button>
                  )}
                </Tab>
                <Tab className="relative focus:outline-none">
                  {({ selected }) => (
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        selected
                          ? "bg-white shadow text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Edit
                    </button>
                  )}
                </Tab>
                <Tab className="relative focus:outline-none">
                  {({ selected }) => (
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        selected
                          ? "bg-white shadow text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
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
                <div className="p-6 bg-white rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Create {activeTab === "category" ? "Category" : "Tag"}
                  </h2>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder={`Enter ${activeTab} name`}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    />
                    <button
                      onClick={handleCreate}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* Edit Panel */}
              <Tab.Panel>
                <div className="p-6 bg-white rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Edit {activeTab === "category" ? "Categories" : "Tags"}
                  </h2>
                  {activeTab === "category" && categories.length === 0 && (
                    <p className="text-gray-500">No categories available</p>
                  )}
                  {activeTab === "tag" && tags.length === 0 && (
                    <p className="text-gray-500">No tags available</p>
                  )}
                  <ul className="space-y-3">
                    {(activeTab === "category" ? categories : tags).map((item) => (
                      <li 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        {editId === item.id ? (
                          <div className="flex items-center gap-3 w-full">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                            <button
                              onClick={() => setShowEditConfirm(true)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditId(null);
                                setEditName("");
                              }}
                              className="px-3 py-1.5 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-gray-800">{item.name || item.category_name || item.tag_name}</span>
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setEditName(item.name || item.category_name || item.tag_name);
                              }}
                              className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                            >
                              <img src={editt} alt="Edit" className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tab.Panel>

              {/* Delete Panel */}
              <Tab.Panel>
                <div className="p-6 bg-white rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Delete {activeTab === "category" ? "Categories" : "Tags"}
                  </h2>
                  {activeTab === "category" && categories.length === 0 && (
                    <p className="text-gray-500">No categories available</p>
                  )}
                  {activeTab === "tag" && tags.length === 0 && (
                    <p className="text-gray-500">No tags available</p>
                  )}
                  <ul className="space-y-3">
                    {(activeTab === "category" ? categories : tags).map((item) => (
                      <li 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <span className="font-medium text-gray-800">{item.name || item.category_name || item.tag_name}</span>
                        <button
                          onClick={() => {
                            setDeleteId(item.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                        >
                          <img src={deletee} alt="Delete" className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title={`Delete ${activeTab === "category" ? "Category" : "Tag"}`}
        message={`Are you sure you want to delete this ${activeTab}? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showEditConfirm}
        onClose={() => setShowEditConfirm(false)}
        onConfirm={confirmEdit}
        title={`Update ${activeTab === "category" ? "Category" : "Tag"}`}
        message={`Are you sure you want to update this ${activeTab}?`}
      />
    </div>
  );
};

export default Admin;