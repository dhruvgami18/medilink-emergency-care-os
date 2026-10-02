import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function fetchHospitalDashboard(hospitalId = "default") {
  const res = await axios.get(`${API_BASE}/hospital/dashboard/${hospitalId}`);
  return res.data;
}

export async function fetchIncomingEmergencies(hospitalId = "default") {
  const res = await axios.get(`${API_BASE}/hospital/${hospitalId}/incoming`);
  return res.data;
}

export async function acceptEmergencyCase(emergencyId, data) {
  const res = await axios.post(`${API_BASE}/hospital/emergency/${emergencyId}/accept`, data);
  return res.data;
}

export async function updateHospitalResources(hospitalId, resources) {
  const res = await axios.put(`${API_BASE}/hospital/${hospitalId}/resources`, { resources });
  return res.data;
}

export async function updateERReadinessStatus(hospitalId, erStatus) {
  const res = await axios.put(`${API_BASE}/hospital/${hospitalId}/status`, { erStatus });
  return res.data;
}

export async function searchPatientHistory(query = "") {
  const res = await axios.get(`${API_BASE}/hospital/patients/search`, {
    params: { query },
  });
  return res.data;
}
