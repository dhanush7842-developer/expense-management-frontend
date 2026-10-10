import api from "../api/axiosConfig";

// GET /api/analytics/summary?month=10&year=2026
export const getAnalyticsSummary = async (month, year) => {
    const response = await api.get("/analytics/summary", { params: { month, year } });
    return response.data;
};

// GET /api/analytics/category-wise?month=10&year=2026
export const getCategorySpending = async (month, year) => {
    const response = await api.get("/analytics/category-wise", { params: { month, year } });
    return response.data;
};

// GET /api/analytics/daily?month=10&year=2026
export const getDailySpending = async (month, year) => {
    const response = await api.get("/analytics/daily", { params: { month, year } });
    return response.data;
};