// lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export const endpoints = {
  students: `${API_BASE_URL}/students/`,
  devices: `${API_BASE_URL}/devices/`,
  policies: `${API_BASE_URL}/policies/`,
  reports: `${API_BASE_URL}/reports/`,
  captureRecords: `${API_BASE_URL}/capture_records/`,
};
