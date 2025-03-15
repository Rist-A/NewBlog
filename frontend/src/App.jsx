import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import NavigationBar from "./components/NavigationBar";
import BlogPage from "./components/BlogPage";
import LoginComponent from "./components/LoginComponent";
import CommentList from "./components/CommentList";
import CreatePostForm from "./components/CreatePostForm";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <Router>
      <NavigationBar /> {/* NavigationBar is outside Routes so it appears on all pages */}
      <Routes>
        <Route path="/profile" element={<ProfilePage/>}/>
        <Route path="/create" element={<CreatePostForm/>}/>
        <Route path="/login" element={<LoginComponent />} /> {/* Login route */}
        <Route path="/" element={<BlogPage />} /> {/* Home route */}
      </Routes>
    </Router>
  );
}

export default App;