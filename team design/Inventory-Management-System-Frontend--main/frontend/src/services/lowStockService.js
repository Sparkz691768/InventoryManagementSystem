import api from "../api/axios";

export const getLowStockNotifications = () => api.get("/LowStock");