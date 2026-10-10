import api from "../api/axiosConfig";

// GET /api/dashboard/summary
export const getSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

// GET /api/dashboard/category-wise
export const getCategoryWise = async () => {
  const response = await api.get("/dashboard/category-wise");
  return response.data;
};

// GET /api/dashboard/monthly?year=2026
export const getMonthly = async (year) => {
  const response = await api.get("/dashboard/monthly", { params: { year } });
  return response.data;
};