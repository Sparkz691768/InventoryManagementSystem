import api from "../api/axios";

export const registerCustomer = (data) => api.post("/Auth/register", data);

export const loginUser = (data) => api.post("/Auth/login", data);