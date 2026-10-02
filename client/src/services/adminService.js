import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function fetchAdminStats() {
  const res = await axios.get(`${API_BASE}/admin/stats`);
  return res.data;
}

export async function fetchHospitals() {
  const res = await axios.get(`${API_BASE}/admin/hospitals`);
  return res.data;
}

export async function createHospital(payload) {
  const res = await axios.post(`${API_BASE}/admin/hospitals`, payload);
  return res.data;
}

export async function updateHospital(id, payload) {
  const res = await axios.put(`${API_BASE}/admin/hospitals/${id}`, payload);
  return res.data;
}

export async function fetchAmbulances() {
  const res = await axios.get(`${API_BASE}/admin/ambulances`);
  return res.data;
}

export async function createAmbulance(payload) {
  const res = await axios.post(`${API_BASE}/admin/ambulances`, payload);
  return res.data;
}

export async function updateAmbulance(id, payload) {
  const res = await axios.put(`${API_BASE}/admin/ambulances/${id}`, payload);
  return res.data;
}

export async function fetchUsers() {
  const res = await axios.get(`${API_BASE}/admin/users`);
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await axios.put(`${API_BASE}/admin/users/${id}`, payload);
  return res.data;
}

export async function fetchAuditLogs() {
  const res = await axios.get(`${API_BASE}/admin/audit-logs`);
  return res.data;
}
