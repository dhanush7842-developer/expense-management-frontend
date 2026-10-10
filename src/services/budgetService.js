import api from "../api/axiosConfig";

// GET /api/budgets/current
export const getCurrentBudget = async () => {
    const response = await api.get("/budgets/current");
    return response.data;
};

// GET /api/budgets?month=10&year=2026
export const getBudget = async (month, year) => {
    const response = await api.get("/budgets", { params: { month, year } });
    return response.data;
};

// PUT /api/budgets
// budget = { amount, month, year }
export const saveBudget = async (budget) => {
    const response = await api.put("/budgets", budget);
    return response.data;
};