import axios from "axios";

// Fallback for local development until the backend is fully wired
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function submitEmergencyReport(payload) {
  // Simulate network delay for frontend testing before backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        emergencyId: "simulated_id_123",
        trackingCode: `ML-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        status: "reported"
      });
    }, 1500);
  });
  
  /* Uncomment this when Node.js backend is running:
  const res = await axios.post(`${API_BASE}/emergencies`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data; 
  */
}