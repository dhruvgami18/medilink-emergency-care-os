import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EmergencyContext = createContext();

export function EmergencyProvider({ identifier, children }) {
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Initial Fetch on Mount
  useEffect(() => {
    const fetchEmergency = async () => {
      if (!identifier) return;
      try {
        setLoading(true);
        // Uses the same endpoint whether fetching by trackingCode (public) or ID (EMT)
        const response = await axios.get(`http://localhost:5000/api/emergencies/${identifier}`);
        setEmergency(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergency();
  }, [identifier]);

  // We will add the Socket.IO listeners here in Step 3!

  return (
    <EmergencyContext.Provider value={{ emergency, setEmergency, loading, error }}>
      {children}
    </EmergencyContext.Provider>
  );
}

// Hook to be used by all tabs and pages
export const useEmergency = () => useContext(EmergencyContext);