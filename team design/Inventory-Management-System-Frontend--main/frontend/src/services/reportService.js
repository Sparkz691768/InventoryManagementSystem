import api from "../api/axios";

export const getDailyReport = (date) =>
  api.get(`/Report/daily?date=${date}`);

export const getMonthlyReport = (year, month) =>
  api.get(`/Report/monthly?year=${year}&month=${month}`);

export const getYearlyReport = (year) =>
  api.get(`/Report/yearly?year=${year}`);