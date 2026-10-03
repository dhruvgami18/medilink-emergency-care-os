import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ShieldAlert, Truck, Phone, Users, Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function DispatchDashboard() {
  const navigate = useNavigate();
  const [emergencies, setEmergencies] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [assigning, setAssigning] = useState(false);

  // Default Map Center
  const defaultCenter = [23.0225, 72.5714];

  // Dummy Available Fleet
  const availableUnits = [
    { id: 'Unit-42', type: 'ALS', eta: '4 mins' },
    { id: 'Unit-19', type: 'BLS', eta: '9 mins' }
  ];

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/emergencies');
        // Sort to put 'reported' (unassigned) at the top
        const sorted = res.data.sort((a, b) => a.status === 'reported' ? -1 : 1);
        setEmergencies(sorted);
        
        if (sorted.length > 0) {
          setSelectedCase(prev => prev ? prev : sorted[0]);
        }
      } catch (err) {
        console.error("Failed to fetch live emergency queue from backend:", err);
      }
    };
    
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAssignUnit = async (unitId) => {
    if (!selectedCase) return;
    setAssigning(true);
    try {
      await axios.put(`http://localhost:5000/api/emergencies/${selectedCase._id}/assign`, {
        assignedAmbulance: unitId
      });
      // Update local state instantly for snappy UI
      setEmergencies(prev => prev.map(e => 
        e._id === selectedCase._id ? { ...e, status: 'dispatched', assignedAmbulance: unitId } : e
      ));
      setSelectedCase(prev => ({ ...prev, status: 'dispatched', assignedAmbulance: unitId }));
    } catch (err) {
      console.error("Assignment failed", err);
      alert("Backend route for assignment needed!");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      
      {/* LEFT: System Navigation */}
      <nav className="bg-slate-900 text-white w-full md:w-20 lg:w-64 flex flex-col p-4 md:h-screen shadow-xl z-20">
        <div className="flex items-center gap-3 mb-10 text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
          <ShieldAlert className="w-8 h-8 text-amber-400" />
          <span className="hidden lg:block tracking-wide">Dispatch HQ</span>
        </div>
        
        <div className="flex flex-col gap-4">
          <button className="bg-blue-600 text-white p-3 rounded-xl flex items-center gap-3 justify-center lg:justify-start transition-colors">
            <Activity className="w-5 h-5" /> <span className="hidden lg:block font-medium">Live Queue</span>
          </button>
          <button className="hover:bg-slate-800 text-slate-300 p-3 rounded-xl flex items-center gap-3 justify-center lg:justify-start transition-colors">
            <Truck className="w-5 h-5" /> <span className="hidden lg:block font-medium">Fleet Status</span>
          </button>
        </div>
      </nav>

      {/* MIDDLE: Incoming Emergencies Queue */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col md:h-screen z-10 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Incidents
          </h2>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{emergencies.length}</span>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-slate-50/50">
          {emergencies.map(emg => (
            <div 
              key={emg._id} 
              onClick={() => setSelectedCase(emg)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedCase?._id === emg._id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-bold text-slate-500">{emg.emergencyCode}</span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${emg.status === 'reported' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {emg.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate">{emg.chiefComplaint || 'Awaiting Assessment'}</h3>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(emg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Active Case Management & Map */}
      <div className="flex-1 flex flex-col md:h-screen relative z-0">
        
        {/* Top Half: Leaflet Fleet Map */}
        <div className="h-1/2 bg-slate-200 relative border-b border-slate-200">
          <MapContainer 
            center={selectedCase?.location || defaultCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer 
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
/>
            {/* Patient Marker */}
            {selectedCase?.location && (
              <Marker position={[selectedCase.location.lat, selectedCase.location.lng]}>
                <Popup className="font-bold text-red-600">🚨 Incident Location</Popup>
              </Marker>
            )}
          </MapContainer>
          
          {/* Map Overlay Badges */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> MCI Grouping: Active
            </div>
          </div>
        </div>

        {/* Bottom Half: Action Panel */}
        <div className="h-1/2 bg-white overflow-y-auto p-6 md:p-8">
          {selectedCase ? (
            <div className="max-w-3xl mx-auto">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 mb-1">{selectedCase.chiefComplaint || 'Emergency Request'}</h1>
                  <p className="text-slate-500 font-medium">Tracking: <span className="font-mono">{selectedCase.emergencyCode}</span></p>
                </div>
                <button className="bg-green-50 text-green-700 hover:bg-green-100 p-3 rounded-full transition-colors flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm font-bold pr-2">Call Reporter</span>
                </button>
              </div>

              {selectedCase.status === 'reported' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Assign Nearest Unit</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableUnits.map(unit => (
                      <div key={unit.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-blue-400 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{unit.id} <span className="text-xs font-normal text-slate-500 ml-1">({unit.type})</span></div>
                            <div className="text-xs font-bold text-emerald-600">ETA: {unit.eta}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAssignUnit(unit.id)}
                          disabled={assigning}
                          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity disabled:bg-slate-400"
                        >
                          Dispatch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <CheckCircle className="w-12 h-12 text-blue-500 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900">Unit Dispatched</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    {selectedCase.assignedAmbulance} is en route. The EMT app and Patient Live Tracker have been automatically updated.
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
              <p>Select an incident from the queue to manage dispatch.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}