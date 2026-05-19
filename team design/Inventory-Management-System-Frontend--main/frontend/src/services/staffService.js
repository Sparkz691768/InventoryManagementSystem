import api from "../api/axios";

export const getStaff = () => api.get("/Staff");
export const getStaffById = (id) => api.get(`/Staff/${id}`);
export const createStaff = (data) => api.post("/Staff", data);
export const updateStaff = (id, data) => api.put(`/Staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/Staff/${id}`);