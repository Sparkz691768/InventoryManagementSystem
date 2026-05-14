import api from "../api/axios";

// Staff Management (existing)
export const getStaff = () => api.get("/Staff");
export const getStaffById = (id) => api.get(`/Staff/${id}`);
export const createStaff = (data) => api.post("/Staff", data);
export const updateStaff = (id, data) => api.put(`/Staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/Staff/${id}`);

// Sales & Invoice Management (new)
export const searchCustomers = (name = "", phone = "", vehicleNumber = "") =>
  api.get("/Customer/search", {
    params: { name, phone, vehicleNumber },
  });

export const getProducts = () => api.get("/Product");

export const createSale = (data) => api.post("/Sale", data);

export const sendInvoice = (saleId) =>
  api.post(`/Sale/${saleId}/send-invoice`);