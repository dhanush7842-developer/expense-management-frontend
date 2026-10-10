import React, { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../services/categoryService";
import { getErrorMessage } from "../utils/helpers";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);   // null = add mode

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    // Field names must match CategoryRequest.java exactly
    const categoryData = { name: name.trim(), description: description.trim() };

    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, categoryData);
        setMessage("Category updated successfully");
      } else {
        await createCategory(categoryData);
        setMessage("Category added successfully");
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    try {
      await deleteCategory(category.id);
      setMessage("Category deleted successfully");
      if (editingId === category.id) {
        resetForm();
      }
      await loadCategories();
    } catch (err) {
      // Example: "Cannot delete this category because it has expenses..."
      setError(getErrorMessage(err, "Failed to delete category"));
    }
  };

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div>
      <h2 className="page-title">Manage Categories</h2>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="card form-card">
        <h3>{editingId ? "Edit Category" : "Add New Category"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="e.g. Education"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Category" : "Add Category"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Your Categories</h3>

        {categories.length === 0 ? (
          <p className="empty-state">No categories yet. Add your first one above.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.description || "-"}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-small" onClick={() => handleEdit(category)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(category)}
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
        )}
      </div>
    </div>
  );
}

export default Categories;
