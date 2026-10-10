import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseList from "./pages/ExpenseList";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import SavingsGoals from "./pages/SavingsGoals";

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages that need login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/expenses/add" element={<AddExpense />} />
        <Route path="/expenses/edit/:id" element={<AddExpense />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/savings-goals" element={<SavingsGoals />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Anything else goes to the dashboard (or login if not logged in) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;