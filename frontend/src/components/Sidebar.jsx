import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ userRole }) => {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <ul>
          {userRole === "admin" && (
            <li>
              <Link to="/admin/categories">Manage Categories</Link>
            </li>
          )}
          <li>
            <Link to="/admin/tags">Manage Tags</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
