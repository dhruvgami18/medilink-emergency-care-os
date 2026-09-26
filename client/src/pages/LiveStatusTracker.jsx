import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function LiveStatusTracker() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(!!code);
  const [error, setError] = useState(null);
  const [inputCode, setInputCode] = useState('');
  
  // Use a ref to track failures so we don't instantly crash the UI on a single dropped packet
  const failedPings = useRef(0);

  useEffect(() => {
    if (!code) return;

    let isMounted = true;
    let intervalId;

    const fetchStatus = async (isInitial = false) => {
      try {
        const res = await axios.get(`${API_BASE}/emergencies/track/${code.toUpperCase()}`);
        if (isMounted) {
          setEmergency(res.data);
          setError(null);
          failedPings.current = 0;
          if (isInitial) setLoading(false);

          // Stop polling if the emergency is resolved
          if (res.data.status === 'arrived' || res.data.status === 'closed') {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        failedPings.current += 1;
        if (isMounted && (isInitial || failedPings.current > 3)) {
          setError("We couldn't find that tracking code, or the connection was lost. Double check and try again.");
          if (isInitial) setLoading(false);
          clearInterval(intervalId);
        }
      }
    };

    // Initial fetch
    fetchStatus(true);

    // Polling interval (every 5 seconds)
    intervalId = setInterval(() => fetchStatus(false), 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [code]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      navigate(`/track/${inputCode.trim().toUpperCase()}`);
    }
  };

  // --- Status Badge Styling Logic ---
  const getStatusBadge = (status) => {
    const styles = {
      reported: "bg-gray-200 text-gray-800",
      dispatched: "bg-theme-accentYellow text-theme-dark",
      en_route: "bg-theme-accentBlue text-theme-dark",
      arrived: "bg-theme-dark text-white",
      closed: "bg-theme-dark text-white opacity-80"
    };
    const labels = {
      reported: "Report Received",
      dispatched: "Ambulance Dispatched",
      en_route: "En Route to Patient",
      arrived: "Arrived at Destination",
      closed: "Case Closed"
    };
    return (
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.reported}`}>
        {labels[status] || "Unknown"}
      </div>
    );
  };

  // --- View 1: Manual Code Entry (No code in URL) ---
  if (!code) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-6">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-theme-dark/5 max-w-md w-full">
          <div className="text-4xl mb-6">📡</div>
          <h1 className="text-3xl font-medium text-theme-dark mb-2 tracking-tight">Live Tracker</h1>
          <p className="text-theme-dark/60 text-sm mb-8">Enter your ML- tracking code to view live ambulance ETA and dispatch status.</p>
          
          <form onSubmit={handleManualSearch} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="e.g. ML-9F3K2" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-4 text-center font-bold tracking-widest uppercase outline-none focus:border-theme-dark transition-colors text-lg"
              autoFocus
            />
            <motion.button whileHover={{ scale: 1.02 }} type="submit" className="w-full bg-theme-dark text-white font-bold py-4 rounded-xl transition-transform">
              Track Emergency
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  // --- View 2: Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-theme-dark/20 border-t-theme-accentBlue rounded-full animate-spin"></div>
          <p className="text-theme-dark/60 font-medium animate-pulse">Locating records...</p>
        </div>
      </div>
    );
  }

  // --- View 3: Error State ---
  if (error && !emergency) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-theme-dark/5 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Code Not Found</h2>
          <p className="text-theme-dark/60 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/track')} className="bg-theme-dark text-white px-6 py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform">
            Try Another Code
          </button>
        </div>
      </div>
    );
  }

  // --- View 4: Live Tracker Dashboard ---
  return (
    <div className="min-h-screen bg-theme-bg pb-12">
      {/* Header Bar */}
      <div className="bg-theme-dark text-white py-10 px-6 md:px-16 rounded-b-[2.5rem] mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mb-4">
              ← Exit Tracker
            </button>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Tracking: {emergency.trackingCode}</h1>
              {emergency.status !== 'closed' && emergency.status !== 'arrived' && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
          </div>
          <div>
            {getStatusBadge(emergency.status)}
          </div>
        </div>
      </div>

      {/* Main Two-Zone Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Map / Live Location Area */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-theme-dark/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-theme-dark/5 flex justify-between items-center bg-white z-10">
            <h2 className="font-bold text-lg">Live Unit Location</h2>
            <span className="text-xs font-bold text-theme-dark/50 bg-theme-bg px-3 py-1 rounded-full">Auto-updating</span>
          </div>
          
          {/* Map Container (Placeholder ready for react-leaflet) */}
          <div className="relative flex-1 min-h-[400px] bg-theme-cardGrey">
             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80" alt="Live Map Interface" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
             
             {/* Dynamic Map Marker */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-theme-dark text-white text-xs font-bold px-3 py-1.5 rounded-full mb-2 shadow-lg whitespace-nowrap">
                  {emergency.status === 'reported' ? 'Awaiting Dispatch' : 'Unit Assigned'}
                </div>
                <div className="w-6 h-6 bg-theme-accentBlue rounded-full border-4 border-white shadow-xl relative">
                   {emergency.status !== 'arrived' && emergency.status !== 'closed' && (
                     <div className="absolute inset-0 rounded-full animate-ping bg-theme-accentBlue opacity-75"></div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Right: Vertical Timeline */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-theme-dark/5 p-6 md:p-8 flex flex-col h-full">
          <h2 className="font-bold text-lg mb-8">Event Timeline</h2>
          
          <div className="flex-1 relative border-l-2 border-theme-dark/10 ml-3 space-y-8 pb-4">
            {emergency.timeline.map((event, index) => {
              const isLatest = index === emergency.timeline.length - 1;
              return (
                <div key={index} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${isLatest ? 'bg-theme-accentYellow border-theme-dark shadow-sm' : 'bg-theme-bg border-theme-dark/30'}`}></div>
                  
                  {/* Timeline Content */}
                  <p className={`font-bold text-sm ${isLatest ? 'text-theme-dark' : 'text-theme-dark/70'}`}>
                    {event.event}
                  </p>
                  <p className="text-xs text-theme-dark/50 mt-1 font-medium tracking-wide">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Fallback info if tracking is complete */}
          {(emergency.status === 'arrived' || emergency.status === 'closed') && (
            <div className="mt-8 bg-theme-bg rounded-xl p-4 text-center border border-theme-dark/5">
              <p className="text-sm font-bold text-theme-dark">Tracking Concluded</p>
              <p className="text-xs text-theme-dark/60 mt-1">Live updates have ended for this case.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}