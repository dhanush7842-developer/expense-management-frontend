import api from "../api/axiosConfig";

// POST /api/auth/register
export const register = async (name, email, password) => {
  const response = await api.post("/auth/register", { name, email, password });
  saveSession(response.data);
  return response.data;
};

// POST /api/auth/login
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  saveSession(response.data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isLoggedIn = () => {
  return localStorage.getItem("token") !== null;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Save token and basic user info in the browser
const saveSession = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify({ id: data.id, name: data.name, email: data.email })
  );
};
