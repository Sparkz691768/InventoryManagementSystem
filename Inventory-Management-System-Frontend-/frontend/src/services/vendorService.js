import api from "../api/axios";

export const getVendors = () => api.get("/Vendor");
export const getVendorById = (id) => api.get(`/Vendor/${id}`);
export const createVendor = (data) => api.post("/Vendor", data);
export const updateVendor = (id, data) => api.put(`/Vendor/${id}`, data);
export const deleteVendor = (id) => api.delete(`/Vendor/${id}`);