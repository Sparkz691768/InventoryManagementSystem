import api from "../api/axios";

export const registerCustomerWithVehicle = (data) =>
  api.post("/Customer/register-with-vehicle", data);

export const getCustomerWithVehicles = (id) => api.get(`/Customer/${id}`);