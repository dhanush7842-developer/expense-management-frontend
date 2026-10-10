import api from "../api/axiosConfig";

// GET /api/savings-goals
export const getAllGoals = async () => {
    const response = await api.get("/savings-goals");
    return response.data;
};

// POST /api/savings-goals
// goal = { goalName, targetAmount, savedAmount, targetDate }
export const createGoal = async (goal) => {
    const response = await api.post("/savings-goals", goal);
    return response.data;
};

// PUT /api/savings-goals/{id}
export const updateGoal = async (id, goal) => {
    const response = await api.put(`/savings-goals/${id}`, goal);
    return response.data;
};

// DELETE /api/savings-goals/{id}
export const deleteGoal = async (id) => {
    await api.delete(`/savings-goals/${id}`);
};

// POST /api/savings-goals/{id}/add-money
export const addMoney = async (id, amount) => {
    const response = await api.post(`/savings-goals/${id}/add-money`, { amount });
    return response.data;
};