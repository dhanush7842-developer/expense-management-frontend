import api from "../api/axiosConfig";

// GET /api/insights
export const getInsights = async () => {
    const response = await api.get("/insights");
    return response.data;
};