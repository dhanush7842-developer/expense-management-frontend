import api from "../api/axiosConfig";

// GET /api/categories
export const getAllCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

// POST /api/categories
// category = { name, description }
export const createCategory = async (category) => {
  const response = await api.post("/categories", category);
  return response.data;
};

// PUT /api/categories/{id}
export const updateCategory = async (id, category) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data;
};

// DELETE /api/categories/{id}
export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};