import api from "./api.service.js";

// --- API CALLS ---

export const loginUser = async (username, password) => {
  
  const res = await api.post("/auth/login", { username, password });
  
  return res;
};

export const registerUser = async (username, email, password) => {

  const res = await api.post("/auth/register", { 
    username, 
    email, 
    password 
  });
console.log(res.data);
  return res;
};

export const logoutUser = async () => {
  try {
    // Backend must have an endpoint to clear the cookie
    await api.post("/auth/logout"); 
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    // Client-side redirect
    window.location.href = "/login";
  }
};



export const checkAuthStatus = async () => {
  try {
    const res = await api.get("/auth/me");
    return res.data;
  } catch (err) {
    return false; 
  }
};