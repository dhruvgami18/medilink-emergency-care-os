import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function triggerEmergencySimulation(hospitalId, severity = "Red") {
  const res = await axios.post(`${API_BASE}/simulation/trigger-incoming`, {
    hospitalId,
    severity,
  });
  return res.data;
}
