import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ShieldAlert, Truck, MapPin, Clock, HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function LiveStatusTracker() {
  const { code } = useParams(); // e.g., EV-992-K
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default coordinates (used if patient location isn't in DB yet)
  const defaultLocation = [23.0225, 72.5714];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/emergencies/${code}`);
        setEmergency(res.data);
      } catch (err) {
        console.error("Failed to fetch tracker data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 5 seconds to get the Dispatch assignment instantly
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [code]);

  // Dynamic First-Aid Engine based on Chief Complaint
  const getFirstAidInstructions = (complaint) => {
    if (!complaint) return "Keep the patient calm and still. Do not move them unless in immediate danger.";
    const lower = complaint.toLowerCase();
    if (lower.includes('cardiac') || lower.includes('heart') || lower.includes('arrest')) {
      return "Begin CPR immediately. Push hard and fast in the center of the chest (100-120 beats per minute).";
    }
    if (lower.includes('bleed')) {
      return "Apply firm, direct pressure to the wound using a clean cloth or shirt.";
    }
    if (lower.includes('breath') || lower.includes('chok')) {
      return "Keep the patient sitting upright. If choking, perform abdominal thrusts.";
    }
    return "Keep the patient calm, warm, and still. Do not offer food or water.";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <ShieldAlert className="w-12 h-12 text-theme-accentYellow" />
          <p className="text-theme-dark font-bold">Connecting to Emergency Network...</p>
        </div>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-theme-dark">Invalid Tracking Code</h2>
          <p className="text-slate-500 mt-2">No emergency found for code: {code}</p>
        </div>
      </div>
    );
  }

  const patientLoc = emergency.location || defaultLocation;
  
  // For demonstration: If dispatched, simulate the ambulance coordinates slightly offset from the patient
  const isDispatched = emergency.status !== 'reported';
  const simulatedAmbulanceLoc = isDispatched 
    ? [patientLoc[0] - 0.015, patientLoc[1] - 0.015] 
    : null;

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col md:flex-row font-sans text-theme-dark">
      
      {/* LEFT PANEL: Rapido-Style Map */}
      <div className="h-[40vh] md:h-screen w-full md:w-2/3 relative z-0">
        <MapContainer 
          center={patientLoc} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer 
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
/>
          {/* Patient Location */}
          <Marker position={patientLoc}>
            <Popup className="font-bold text-red-600">Your Location</Popup>
          </Marker>

          {/* Ambulance Location (Only shows when Dispatch assigns it) */}
          {isDispatched && simulatedAmbulanceLoc && (
            <Marker position={simulatedAmbulanceLoc}>
              <Popup className="font-bold text-blue-600">🚑 {emergency.assignedAmbulance} En Route</Popup>
            </Marker>
          )}
        </MapContainer>

        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="font-bold tracking-wide text-sm">LIVE TRACKING</span>
        </div>
      </div>

      {/* RIGHT PANEL: Tracker Details & First Aid */}
      <div className="h-[60vh] md:h-screen w-full md:w-1/3 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-theme-dark/10 bg-theme-bg/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs font-bold text-theme-dark/50 uppercase tracking-wider mb-1">Emergency Code</div>
              <div className="text-2xl font-mono font-bold">{emergency.emergencyCode || code}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${isDispatched ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDispatched ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              {isDispatched ? 'Unit Assigned' : 'Finding Unit...'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-theme-dark/5 text-center">
              <Truck className={`w-6 h-6 mx-auto mb-2 ${isDispatched ? 'text-blue-500' : 'text-slate-300'}`} />
              <div className="text-xl font-black text-theme-dark">{emergency.assignedAmbulance || '--'}</div>
              <div className="text-xs font-bold text-theme-dark/50 uppercase mt-1">Ambulance</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-theme-dark/5 text-center">
              <Clock className={`w-6 h-6 mx-auto mb-2 ${isDispatched ? 'text-theme-accentYellow' : 'text-slate-300'}`} />
              <div className="text-xl font-black text-theme-dark">{isDispatched ? '8 MIN' : '--'}</div>
              <div className="text-xs font-bold text-theme-dark/50 uppercase mt-1">Est. Arrival</div>
            </div>
          </div>
        </div>

        {/* Dynamic First-Aid Prompts */}
        <div className="p-6 border-b border-theme-dark/10">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <HeartPulse className="w-24 h-24 text-red-500" />
            </div>
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 relative z-10">Immediate Action Required</h3>
            <p className="text-sm text-red-900 font-medium leading-relaxed relative z-10">
              {getFirstAidInstructions(emergency.chiefComplaint)}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="p-6 flex-1">
          <h3 className="text-xs font-bold text-theme-dark/50 uppercase tracking-wider mb-6">Status Timeline</h3>
          
          <div className="relative pl-6 space-y-8 border-l-2 border-theme-dark/10 ml-3">
            
            <div className="relative">
              <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center ring-4 ring-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm">Emergency Reported</h4>
              <p className="text-xs text-theme-dark/60 mt-1">System received your request.</p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${isDispatched ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                <Truck className="w-3 h-3" />
              </div>
              <h4 className={`font-bold text-sm ${isDispatched ? 'text-blue-600' : 'text-slate-400'}`}>Unit Dispatched</h4>
              <p className="text-xs text-theme-dark/60 mt-1">
                {isDispatched ? `${emergency.assignedAmbulance} is navigating to your location.` : 'Waiting for dispatch assignment.'}
              </p>
            </div>

            <div className="relative">
              <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${emergency.status === 'arrived' ? 'bg-theme-accentYellow text-theme-dark shadow-lg shadow-yellow-500/30 animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                <MapPin className="w-3 h-3" />
              </div>
              <h4 className={`font-bold text-sm ${emergency.status === 'arrived' ? 'text-theme-dark' : 'text-slate-400'}`}>Arrived on Scene</h4>
              <p className="text-xs text-theme-dark/60 mt-1">First responders have reached your location.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}