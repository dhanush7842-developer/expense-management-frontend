import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllCategories } from "../services/categoryService";
import {
  createExpense,
  getExpenseById,
  updateExpense,
} from "../services/expenseService";
import { getErrorMessage, getTodayDate } from "../utils/helpers";

function AddExpense() {
  const { id } = useParams();          // exists only on /expenses/edit/:id
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(getTodayDate());
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load categories (and the expense itself in edit mode)
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryList = await getAllCategories();
        setCategories(categoryList);

        if (isEditMode) {
          const expense = await getExpenseById(id);
          setTitle(expense.title);
          setAmount(expense.amount);
          setExpenseDate(expense.expenseDate);
          setDescription(expense.description || "");
          setCategoryId(expense.categoryId);
        } else if (categoryList.length > 0) {
          setCategoryId(categoryList[0].id);   // pre-select the first category
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load data"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!expenseDate) {
      setError("Date is required");
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    // Field names must match ExpenseRequest.java exactly
    const expenseData = {
      title: title.trim(),
      amount: Number(amount),
      expenseDate: expenseDate,
      description: description.trim(),
      categoryId: Number(categoryId),
    };

    setSaving(true);
    try {
      if (isEditMode) {
        await updateExpense(id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      navigate("/expenses");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save expense"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="page-title">{isEditMode ? "Edit Expense" : "Add Expense"}</h2>

      <div className="card form-card">
        {error && <div className="error-message">{error}</div>}

        {categories.length === 0 ? (
          <p>
            You have no categories yet. Please <Link to="/categories">add a category</Link> first.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Lunch at canteen"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                rows="3"
                placeholder="Any notes about this expense"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="actions">
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Saving..." : isEditMode ? "Update Expense" : "Add Expense"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/expenses")}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddExpense;