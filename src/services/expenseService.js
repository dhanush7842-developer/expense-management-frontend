import api from "../api/axiosConfig";

// GET /api/expenses
export const getAllExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data;
};

// GET /api/expenses/{id}
export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

// POST /api/expenses
// expense = { title, amount, expenseDate, description, categoryId }
export const createExpense = async (expense) => {
  const response = await api.post("/expenses", expense);
  return response.data;
};

// PUT /api/expenses/{id}
export const updateExpense = async (id, expense) => {
  const response = await api.put(`/expenses/${id}`, expense);
  return response.data;
};

// DELETE /api/expenses/{id}
export const deleteExpense = async (id) => {
  await api.delete(`/expenses/${id}`);
};