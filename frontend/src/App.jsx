import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import NavigationBar from "./components/NavigationBar";
import BlogPage from "./components/BlogPage";
import LoginComponent from "./components/LoginComponent";
import CreatePostForm from "./components/CreatePostForm";
import ProfilePage from "./components/ProfilePage";
import CommentDetail from "./components/CommentDetail";
import EditPostForm from "./components/EditPostForm";
import Admin from "./components/Admin";
import { ThemeProvider } from './ThemeContext.jsx';
import Footer from "./components/Footer.jsx";
import Chat from "./components/Chat.jsx"


// Enhanced Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userRole: null,
    isLoading: true
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuthState({
          isAuthenticated: true,
          userRole: decoded.role,
          isLoading: false
        });
      } catch (error) {
        console.error("Invalid token:", error);
        sessionStorage.removeItem("token");
        setAuthState({
          isAuthenticated: false,
          userRole: null,
          isLoading: false
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        userRole: null,
        isLoading: false
      });
    }
  }, []);

  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(authState.userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          
          // Try to get additional user data if needed
          try {
            const response = await axios.get(`http://localhost:5000/user/${decodedToken.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser({
              ...decodedToken,
              ...response.data.user
            });
          } catch (apiError) {
            console.error("Additional user fetch failed, using basic token data:", apiError);
            setUser(decodedToken);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          sessionStorage.removeItem("token");
        }
      }
      setAppLoading(false);
    };

    fetchUser();
  }, []);

  if (appLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
  
        <NavigationBar user={user} />
       
        

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/" element={<BlogPage />} />
          
          {/* Protected user routes */}
          <Route>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create" element={<CreatePostForm />} />
            <Route path="/posts/:post_id/comments" element={<CommentDetail />} />
            <Route path="/editpost/:postId" element={<EditPostForm />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
          
          {/* Admin panel route - single route for both admin and subadmin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'subadmin']}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route */}
          <Route 
            path="*" 
            element={
              <Navigate 
                to={
                  user?.role === 'admin' || user?.role === 'subadmin' 
                    ? "/admin" 
                    : "/"
                } 
                replace 
              />
            } 
          />
        </Routes>
        
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;