import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteExpense, getAllExpenses } from "../services/expenseService";
import { formatCurrency, getErrorMessage } from "../utils/helpers";

function ExpenseList() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await getAllExpenses();
        setExpenses(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load expenses"));
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete expense "${title}"?`);
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    try {
      await deleteExpense(id);
      // Remove it from the screen without reloading everything
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      setMessage("Expense deleted successfully");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete expense"));
    }
  };

  // Search by title or category name
  const filteredExpenses = expenses.filter((expense) => {
    const text = searchText.trim().toLowerCase();
    const titleMatch = (expense?.title || "").toLowerCase().includes(text);
    const categoryMatch = (expense?.categoryName || "").toLowerCase().includes(text);
    return titleMatch || categoryMatch;
  });

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense?.amount || 0),
    0
  );

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  return (
    <div>
      <div className="toolbar">
        <h2 className="page-title">My Expenses</h2>
        <button className="btn" onClick={() => navigate("/expenses/add")}>
          + Add Expense
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="card">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title or category..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {filteredExpenses.length === 0 ? (
          <p className="empty-state">No expenses found.</p>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.expenseDate}</td>
                      <td>{expense.title}</td>
                      <td>{expense.categoryName}</td>
                      <td>{formatCurrency(expense.amount)}</td>
                      <td>{expense.description || "-"}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-small"
                            onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDelete(expense.id, expense.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="list-total">
              {filteredExpenses.length} expense(s) | Total: <strong>{formatCurrency(totalAmount)}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ExpenseList;