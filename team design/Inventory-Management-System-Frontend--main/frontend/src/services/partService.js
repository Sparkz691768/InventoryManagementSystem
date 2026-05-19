import api from "../api/axios";

export const getParts = () => api.get("/Part");

export const createPart = (data) => api.post("/Part", data);

export const updatePart = (id, data) => api.put(`/Part/${id}`, data);

export const deletePart = (id) => api.delete(`/Part/${id}`);