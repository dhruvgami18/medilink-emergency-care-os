import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, CheckCircle, Truck, ShieldAlert } from 'lucide-react';

// Leaflet Maps for Client
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  const { code } = useParams();
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState(code || '');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async (codeToFetch) => {
    if (!codeToFetch) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://localhost:5000/api/emergencies/${codeToFetch}`);
      setCaseData(res.data);
    } catch (err) {
      setError('Invalid tracking code or emergency not found.');
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  // Poll for live updates every 5 seconds
  useEffect(() => {
    if (code) {
      fetchStatus(code);
      const interval = setInterval(() => fetchStatus(code), 5000);
      return () => clearInterval(interval);
    }
  }, [code]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      navigate(`/track/${trackingCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark flex flex-col items-center py-12 px-6">
      
      {/* Header & Search */}
      <div className="w-full max-w-3xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          <ShieldAlert className="w-8 h-8 text-theme-accentBlue" />
          Medilink <span className="opacity-50 font-medium">Tracker</span>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <input 
            type="text" 
            placeholder="Enter EV-XXXX Code" 
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            className="bg-white border border-theme-dark/10 rounded-xl px-4 py-3 text-sm font-bold font-mono outline-none focus:border-theme-accentBlue w-full md:w-64"
          />
          <button type="submit" className="bg-theme-dark text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition">
            Track
          </button>
        </form>
      </div>

      {loading && !caseData && (
        <div className="text-theme-dark/50 font-bold flex items-center gap-2 mt-20">
          <Activity className="animate-spin w-5 h-5" /> Locating Emergency Data...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 border border-red-100 px-6 py-4 rounded-xl font-bold max-w-md text-center mt-10">
          {error}
        </div>
      )}

      {/* Tracker Dashboard */}
      {caseData && (
        <div className="w-full max-w-3xl space-y-6">
          
          {/* Top Status Card */}
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Live Status
              </div>
              <h2 className="text-3xl font-black text-theme-dark uppercase">
                {caseData.status.replace(/_/g, ' ')}
              </h2>
              <p className="text-theme-dark/60 font-medium mt-1">
                Requested at {new Date(caseData.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>

            {caseData.assignedAmbulance && (
              <div className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl flex items-center gap-4">
                <div className="bg-theme-accentBlue text-white p-3 rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-widest mb-0.5">Assigned Unit</div>
                  <div className="font-bold text-lg">{caseData.assignedAmbulance}</div>
                </div>
              </div>
            )}
          </div>

          {/* Map & Destination Area */}
          {(caseData.location || caseData.destinationHospital) && (
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-theme-dark/5">
              
              {/* Destination Header if available */}
              {caseData.destinationHospital && (
                <div className="bg-slate-50 p-6 border-b border-theme-dark/5 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-bold text-theme-accentBlue uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" /> ER Destination Confirmed
                    </div>
                    <h3 className="font-bold text-xl">{caseData.destinationHospital.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-widest mb-1">ETA</div>
                    <div className="font-black text-xl text-theme-dark">{caseData.destinationHospital.eta}</div>
                  </div>
                </div>
              )}

              {/* Patient Map Routing */}
              <div className="h-64 md:h-96 w-full relative bg-slate-200">
                <MapContainer 
                  center={caseData.location ? [caseData.location.lat, caseData.location.lng] : [23.0225, 72.5714]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {/* Incident Marker */}
                  {caseData.location && (
                    <Marker position={[caseData.location.lat, caseData.location.lng]}>
                      <Popup>🚨 Your Pickup Location</Popup>
                    </Marker>
                  )}

                  {/* Hospital & Route Marker */}
                  {caseData.destinationHospital && caseData.location && (
                    <>
                      <Marker position={[caseData.destinationHospital.lat, caseData.destinationHospital.lng]}>
                        <Popup>🏥 {caseData.destinationHospital.name}</Popup>
                      </Marker>
                      <Polyline 
                        positions={[
                          [caseData.location.lat, caseData.location.lng], 
                          [caseData.destinationHospital.lat, caseData.destinationHospital.lng]
                        ]} 
                        color="#3b82f6" 
                        weight={5} 
                        dashArray="10, 10" 
                      />
                    </>
                  )}
                </MapContainer>
              </div>
            </div>
          )}

          {/* Client Dynamic Timeline */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-theme-dark/5">
            <h3 className="font-bold text-lg mb-6">Response Timeline</h3>
            <div className="space-y-6 relative border-l-2 border-theme-dark/10 ml-3 pl-6">
              
              <TrackerStep 
                title="Emergency Reported" 
                time={new Date(caseData.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                isActive={true} 
              />
              
              <TrackerStep 
                title="Ambulance Dispatched" 
                desc={caseData.assignedAmbulance ? `${caseData.assignedAmbulance} is en route to your location.` : "Searching for nearest available unit..."}
                isActive={!!caseData.assignedAmbulance} 
              />
              
              <TrackerStep 
                title="Routing to Hospital" 
                desc={caseData.destinationHospital ? `En route to ${caseData.destinationHospital.name}.` : "Awaiting EMT assessment."}
                isActive={!!caseData.destinationHospital} 
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function TrackerStep({ title, desc, time, isActive }) {
  return (
    <div className={`relative ${!isActive ? 'opacity-40' : ''}`}>
      <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-theme-accentBlue' : 'bg-gray-300'}`}></div>
      <div className="font-bold text-theme-dark mb-1">{title} {time && <span className="text-xs font-medium opacity-50 ml-2">{time}</span>}</div>
      {desc && <div className="text-sm text-theme-dark/70 font-medium">{desc}</div>}
    </div>
  );
}