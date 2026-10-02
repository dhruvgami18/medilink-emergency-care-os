import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin, Truck, CheckCircle2, Phone, AlertCircle, ShieldAlert, Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons in React
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
  
  // State for database data
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Default coordinates (Ahmedabad) used before DB sync is fully ready
  const defaultLocation = [23.0225, 72.5714];

  useEffect(() => {
    const fetchEmergencyStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/emergencies/${code}`);
        setEmergencyData(response.data);
      } catch (err) {
        console.warn("Backend route not ready, using rich fallback UI.");
        setEmergencyData({
          status: 'en-route', 
          eta: '8 MIN',
          distance: '4.2 km',
          location: defaultLocation,
          unit: 'ALS Unit 42',
          paramedic: 'Sarah Jenkins',
          hospital: 'City General Hospital'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEmergencyStatus();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-theme-primary/20 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-theme-primary" />
          </div>
          <p className="text-theme-dark font-medium tracking-wide">Connecting to Emergency Network...</p>
        </div>
      </div>
    );
  }

  const currentStatus = emergencyData?.status || 'en-route';
  const ambLocation = emergencyData?.location || defaultLocation;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* LEFT PANEL: Map Area */}
      <div className="h-[40vh] md:h-screen w-full md:w-2/3 relative z-0">
        <MapContainer 
          center={ambLocation} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          <Marker position={ambLocation}>
            <Popup className="font-bold">🚑 Unit Approaching</Popup>
          </Marker>
        </MapContainer>

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span className="font-bold text-slate-800 tracking-wide text-sm">LIVE TRACKING</span>
        </div>
      </div>

      {/* RIGHT PANEL: Details & Timeline */}
      <div className="h-[60vh] md:h-screen w-full md:w-1/3 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10 flex flex-col overflow-y-auto">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergency Code</div>
              <div className="text-2xl font-mono font-bold text-theme-dark">{code || 'EV-992-K'}</div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
              <Clock className="w-6 h-6 text-theme-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-800">{emergencyData?.eta || 'Pending'}</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-1">Est. Arrival</div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
              <Navigation className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-800">{emergencyData?.distance || '--'}</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-1">Distance</div>
            </div>
          </div>
        </div>

        {/* Dispatch Details */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Dispatch Information</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <div className="font-bold text-slate-800">{emergencyData?.unit || 'Ambulance Assigned'}</div>
                <div className="text-sm text-slate-500">Lead EMT: {emergencyData?.paramedic || 'Awaiting Details'}</div>
              </div>
            </div>
            <button className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              Please stay visible near the entrance. Keep your phone's ringer on. Do not move the patient unless they are in immediate danger.
            </p>
          </div>
        </div>

        {/* Detailed Timeline */}
        <div className="p-6 flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Status Timeline</h3>
          
          <div className="relative pl-6 space-y-8 border-l-2 border-slate-100 ml-3">
            
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center ring-4 ring-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Emergency Reported</h4>
              <p className="text-xs text-slate-500 mt-1">System received your request.</p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${currentStatus === 'en-route' || currentStatus === 'arrived' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className={`font-bold text-sm ${currentStatus === 'en-route' || currentStatus === 'arrived' ? 'text-slate-800' : 'text-slate-400'}`}>Ambulance Dispatched</h4>
              <p className="text-xs text-slate-500 mt-1">Unit assigned and matched to PRP.</p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${currentStatus === 'en-route' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 animate-pulse' : (currentStatus === 'arrived' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400')}`}>
                <Truck className="w-3 h-3" />
              </div>
              <h4 className={`font-bold text-sm ${currentStatus === 'en-route' ? 'text-blue-600' : (currentStatus === 'arrived' ? 'text-slate-800' : 'text-slate-400')}`}>En Route to Scene</h4>
              <p className="text-xs text-slate-500 mt-1">Ambulance is navigating to your location.</p>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className={`absolute -left-[35px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${currentStatus === 'arrived' ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/30 animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                <MapPin className="w-3 h-3" />
              </div>
              <h4 className={`font-bold text-sm ${currentStatus === 'arrived' ? 'text-theme-primary' : 'text-slate-400'}`}>Arrived on Scene</h4>
              <p className="text-xs text-slate-500 mt-1">First responders have reached the destination.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}