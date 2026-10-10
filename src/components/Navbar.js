import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">💰 Smart Expense Manager</div>

      <div className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/expenses" end>Expenses</NavLink>
        <NavLink to="/expenses/add">Add Expense</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/savings-goals">Savings Goals</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </div>

      <div className="navbar-user">
        <span>Hi, {user ? user.name : "User"}</span>
        <button className="btn btn-danger btn-small" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;