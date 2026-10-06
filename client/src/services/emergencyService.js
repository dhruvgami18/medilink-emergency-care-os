import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function submitEmergencyReport(payload) {
  const res = await axios.post(`${API_BASE}/emergencies`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data; 
}