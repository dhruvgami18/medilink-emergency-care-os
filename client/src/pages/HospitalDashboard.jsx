import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, 
  Activity, 
  Bed, 
  Heart, 
  Droplet, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Navigation, 
  RefreshCw, 
  LogOut, 
  Save, 
  ShieldAlert, 
  Plus, 
  Minus 
} from 'lucide-react';
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

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function HospitalDashboard() {
  const navigate = useNavigate();

  // Active view tab: 'incoming', 'capacity', or 'map'
  const [activeTab, setActiveTab] = useState('incoming');

  // List of all partner hospitals in MongoDB
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [currentHospital, setCurrentHospital] = useState(null);

  // Incoming emergencies routed by EMTs to this hospital
  const [incomingEmergencies, setIncomingEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Editable capacity state for manual updates by hospital staff
  const [capacityForm, setCapacityForm] = useState({
    totalGeneralBeds: 50,
    availableGeneralBeds: 10,
    totalIcuBeds: 15,
    availableIcuBeds: 3,
    status: 'Operational',
    bloodBank: {
      A_pos: 10, A_neg: 4,
      B_pos: 12, B_neg: 3,
      O_pos: 15, O_neg: 4,
      AB_pos: 6, AB_neg: 2
    }
  });

  // Modal / Prompt for accept/reject notes
  const [activeActionModal, setActiveActionModal] = useState(null); // { emergencyId, action: 'accepted' | 'rejected' }
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // 1. Fetch all hospitals on component mount
  useEffect(() => {
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/hospitals`);
      if (res.data && res.data.length > 0) {
        setHospitals(res.data);
        // Default to first hospital if none selected yet
        if (!selectedHospitalId) {
          setSelectedHospitalId(res.data[0]._id);
          setCurrentHospital(res.data[0]);
          populateCapacityForm(res.data[0]);
        } else {
          const found = res.data.find(h => h._id === selectedHospitalId);
          if (found) {
            setCurrentHospital(found);
            populateCapacityForm(found);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Populate local form fields when a hospital is loaded
  const populateCapacityForm = (hospital) => {
    setCapacityForm({
      totalGeneralBeds: hospital.totalGeneralBeds || 50,
      availableGeneralBeds: hospital.availableGeneralBeds || 0,
      totalIcuBeds: hospital.totalIcuBeds || 15,
      availableIcuBeds: hospital.availableIcuBeds || 0,
      status: hospital.status || 'Operational',
      bloodBank: hospital.bloodBank || {
        A_pos: 10, A_neg: 4,
        B_pos: 12, B_neg: 3,
        O_pos: 15, O_neg: 4,
        AB_pos: 6, AB_neg: 2
      }
    });
  };

  // Switch between hospitals in the dropdown
  const handleHospitalChange = (e) => {
    const newId = e.target.value;
    setSelectedHospitalId(newId);
    const found = hospitals.find(h => h._id === newId);
    if (found) {
      setCurrentHospital(found);
      populateCapacityForm(found);
    }
  };

  // 2. Fetch incoming emergencies routed to this hospital
  const fetchIncomingEmergencies = async (showSpinner = false) => {
    if (!selectedHospitalId) return;
    if (showSpinner) setIsRefreshing(true);

    try {
      const res = await axios.get(`${API_BASE}/hospitals/${selectedHospitalId}/incoming`);
      setIncomingEmergencies(res.data || []);
    } catch (err) {
      console.error("Error fetching incoming emergencies:", err);
    } finally {
      if (showSpinner) setIsRefreshing(false);
    }
  };

  // Poll incoming emergencies every 4 seconds for real-time responsiveness
  useEffect(() => {
    if (selectedHospitalId) {
      fetchIncomingEmergencies();
      const interval = setInterval(() => {
        fetchIncomingEmergencies(false);
      }, 4000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHospitalId]);

  // 3. Save Capacity & Blood Bank Changes to MongoDB (Manual Update by Staff)
  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    if (!selectedHospitalId) return;

    try {
      setSaveMessage('Saving updates to database...');
      const res = await axios.put(`${API_BASE}/hospitals/${selectedHospitalId}/capacity`, capacityForm);
      setCurrentHospital(res.data);
      setSaveMessage('✅ Capacity and blood bank status updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      fetchHospitals();
    } catch (err) {
      console.error("Save capacity error:", err);
      setSaveMessage('❌ Failed to update capacity. Please try again.');
    }
  };

  // Quick increment/decrement helper for bed inputs
  const adjustValue = (field, delta, min = 0, max = 999) => {
    setCapacityForm(prev => {
      const current = Number(prev[field]) || 0;
      const nextVal = Math.max(min, Math.min(max, current + delta));
      return { ...prev, [field]: nextVal };
    });
  };

  // Quick increment/decrement helper for blood units
  const adjustBloodUnit = (bloodGroup, delta) => {
    setCapacityForm(prev => {
      const current = Number(prev.bloodBank?.[bloodGroup]) || 0;
      const nextVal = Math.max(0, current + delta);
      return {
        ...prev,
        bloodBank: {
          ...prev.bloodBank,
          [bloodGroup]: nextVal
        }
      };
    });
  };

  // 4. Handle Hospital Staff Action (Accept or Reject/Divert Transfer)
  const handleOpenActionModal = (emergency, action) => {
    setActiveActionModal({ emergency, action });
    const isIcu = emergency.requiredBedType === 'ICU';
    setActionNotes(
      action === 'accepted' 
        ? (isIcu ? 'ICU Bed & Ventilator reserved. Critical care team on standby.' : 'Trauma Bay 2 prepped. General bed reserved.') 
        : (isIcu ? 'ICU beds at 100% capacity. Diverting to alternate trauma center.' : 'ER general bed capacity full. Diverting.')
    );
  };

  const handleConfirmAction = async () => {
    if (!activeActionModal) return;
    setIsSubmittingAction(true);

    try {
      await axios.put(`${API_BASE}/hospitals/emergencies/${activeActionModal.emergency._id}/respond`, {
        hospitalStatus: activeActionModal.action,
        notes: actionNotes,
        hospitalId: selectedHospitalId
      });

      // Refetch hospitals immediately to see automatic bed decrement
      await fetchHospitals();
      await fetchIncomingEmergencies();
      setActiveActionModal(null);
      setActionNotes('');
    } catch (err) {
      console.error("Action error:", err);
      alert(`Could not process request: ${err.message}`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center font-sans text-theme-dark">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-theme-dark/5 flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-theme-dark" />
          <span className="font-bold text-sm">Connecting to Hospital ER Network...</span>
        </div>
      </div>
    );
  }

  // Count incoming pending requests
  const pendingRequestsCount = incomingEmergencies.filter(e => e.hospitalStatus === 'pending' || !e.hospitalStatus || e.hospitalStatus === 'none').length;

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark flex flex-col">
      
      {/* --- TOP NAVBAR --- */}
      <header className="bg-theme-dark text-white px-6 py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Portal Identifier */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-theme-accentYellow text-theme-dark flex items-center justify-center font-bold text-xl">
              🏥
            </div>
            <div>
              <div className="text-xl font-bold flex items-center gap-2">
                MediLink <span className="text-theme-accentYellow text-sm font-semibold uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded-full">ER Dashboard</span>
              </div>
              <p className="text-xs text-white/60">Emergency Department & Resource Coordination</p>
            </div>
          </div>

          {/* Hospital Switcher & Connection Indicator */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <Building2 className="w-4 h-4 text-theme-accentYellow" />
              <label htmlFor="hospitalSelect" className="text-xs text-white/70 font-semibold">Active Hospital:</label>
              <select
                id="hospitalSelect"
                value={selectedHospitalId}
                onChange={handleHospitalChange}
                className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer pr-2"
              >
                {hospitals.map(h => (
                  <option key={h._id} value={h._id} className="bg-theme-dark text-white">
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchIncomingEmergencies(true)}
              disabled={isRefreshing}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* --- SUB-BAR: QUICK STATUS & STATS --- */}
      <div className="bg-white border-b border-theme-dark/10 shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* General Beds Stat */}
          <div className="bg-theme-bg p-4 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-bold text-theme-dark/60 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-blue-600" /> General Beds</span>
              <span className={capacityForm.availableGeneralBeds > 5 ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                {capacityForm.availableGeneralBeds > 5 ? 'Adequate' : 'Low'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-theme-dark">{capacityForm.availableGeneralBeds}</span>
              <span className="text-xs text-theme-dark/50">/ {capacityForm.totalGeneralBeds} Available</span>
            </div>
          </div>

          {/* ICU Beds Stat */}
          <div className="bg-theme-bg p-4 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-bold text-theme-dark/60 uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-red-600" /> ICU Capacity</span>
              <span className={capacityForm.availableIcuBeds > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {capacityForm.availableIcuBeds > 0 ? 'Open' : 'Full'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-theme-dark">{capacityForm.availableIcuBeds}</span>
              <span className="text-xs text-theme-dark/50">/ {capacityForm.totalIcuBeds} Available</span>
            </div>
          </div>

          {/* Operational Status */}
          <div className="bg-theme-bg p-4 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
            <div className="text-xs font-bold text-theme-dark/60 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-600" /> ER Diversion Status
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                capacityForm.status === 'Operational' ? 'bg-green-500 animate-pulse' :
                capacityForm.status === 'Beds Full' ? 'bg-amber-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm font-bold text-theme-dark">{capacityForm.status}</span>
            </div>
          </div>

          {/* Pending Inbound Requests */}
          <div className="bg-theme-bg p-4 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
            <div className="text-xs font-bold text-theme-dark/60 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" /> Inbound Transport
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{pendingRequestsCount}</span>
              <span className="text-xs text-theme-dark/50">Awaiting ER Decision</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- MAIN DASHBOARD BODY --- */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 flex flex-col">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-theme-dark/10">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'incoming' 
                ? 'bg-theme-dark text-white shadow-md' 
                : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
            }`}
          >
            <Activity className="w-4 h-4 text-theme-accentYellow" />
            Inbound Emergency Transports
            {pendingRequestsCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'capacity' 
                ? 'bg-theme-dark text-white shadow-md' 
                : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
            }`}
          >
            <Bed className="w-4 h-4 text-theme-accentBlue" />
            Beds & Blood Bank Management
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'map' 
                ? 'bg-theme-dark text-white shadow-md' 
                : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            Live Inbound Map
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: INBOUND EMERGENCY TRANSPORTS (EMT REQUESTS)        */}
        {/* ======================================================== */}
        {activeTab === 'incoming' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-bold text-theme-dark flex items-center gap-2">
                  Emergency Transport Requests
                </h2>
                <p className="text-sm text-theme-dark/60">
                  Field EMT units routing patient transfers to <strong className="text-theme-dark">{currentHospital?.name}</strong>. Accept or reject according to bed availability.
                </p>
              </div>
              <div className="text-xs bg-white px-3 py-1.5 rounded-full border border-theme-dark/10 font-semibold text-theme-dark/70">
                Auto-syncing every 4s
              </div>
            </div>

            {incomingEmergencies.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-theme-dark/5 shadow-sm max-w-xl mx-auto mt-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Inbound Transports</h3>
                <p className="text-sm text-theme-dark/60 leading-relaxed mb-6">
                  There are currently no active ambulance units routing patients to {currentHospital?.name}. New transfers dispatched by EMTs will appear here instantly.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-semibold bg-theme-bg px-4 py-2 rounded-xl text-theme-dark/80">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Listening on MediLink Dispatch Radio
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {incomingEmergencies.map((emergency) => {
                  const isPending = emergency.hospitalStatus === 'pending' || !emergency.hospitalStatus || emergency.hospitalStatus === 'none';
                  const isAccepted = emergency.hospitalStatus === 'accepted';
                  const isRejected = emergency.hospitalStatus === 'rejected';

                  // Grab most recent vitals log if available
                  const latestVitals = emergency.vitalsLog && emergency.vitalsLog.length > 0 
                    ? emergency.vitalsLog[emergency.vitalsLog.length - 1] 
                    : null;

                  return (
                    <div 
                      key={emergency._id}
                      className={`bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border transition-all ${
                        isPending ? 'border-amber-300 ring-2 ring-amber-200/50 bg-amber-50/10' :
                        isAccepted ? 'border-green-300' : 'border-red-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-theme-dark/5 pb-5 mb-5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-theme-dark text-white">
                            {emergency.emergencyCode}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/60 bg-theme-bg px-3 py-1 rounded-xl">
                            Ambulance: {emergency.assignedAmbulance || 'Unit AMB-01'}
                          </span>
                          <span className="text-xs text-theme-dark/50">
                            Reported: {new Date(emergency.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5" /> Awaiting ER Acceptance
                            </span>
                          )}
                          {isAccepted && (
                            <span className="bg-green-100 text-green-800 border border-green-300 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Transfer Accepted (ER Prepped)
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-red-100 text-red-800 border border-red-300 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 text-red-600" /> Diverted / Full
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Patient Info & Vitals Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Column 1: Patient PRP Data */}
                        <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider">
                                Patient Profile (PRP)
                              </span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                emergency.requiredBedType === 'ICU' 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                {emergency.requiredBedType === 'ICU' ? '⚡ ICU Bed Required' : '🛏️ Normal Bed Required'}
                              </span>
                            </div>

                            <div className="text-xl font-bold text-theme-dark mb-1">
                              {emergency.patientName || 'Unknown Patient'}
                            </div>
                            <div className="text-xs font-medium text-theme-dark/70 mb-3">
                              Age: <span className="font-bold">{emergency.age || 'N/A'}</span> • Gender: <span className="font-bold">{emergency.gender || 'Unknown'}</span>
                            </div>
                            <div className="text-xs font-bold text-theme-dark/50 uppercase tracking-wider mb-1">
                              Chief Complaint
                            </div>
                            <p className="text-sm font-semibold text-red-600 bg-white p-2.5 rounded-xl border border-theme-dark/5">
                              {emergency.chiefComplaint || 'Emergency Assessment in Progress'}
                            </p>
                          </div>
                          {emergency.medicalHistory && (
                            <div className="mt-3 text-xs text-theme-dark/70">
                              <span className="font-bold">History:</span> {emergency.medicalHistory}
                            </div>
                          )}
                        </div>

                        {/* Column 2: Live Vitals Telemetry */}
                        <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider flex items-center gap-1">
                              <Activity className="w-3 h-3 text-blue-500" /> In-Transit Telemetry
                            </span>
                            {latestVitals ? (
                              <span className="text-[10px] font-mono text-green-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Live Stream
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-blue-600 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Baseline Assessment
                              </span>
                            )}
                          </div>

                          {(() => {
                            const v = latestVitals || (emergency.vitalsLog && emergency.vitalsLog.length > 0 ? emergency.vitalsLog[0] : null) || { hr: '76', bp: '120/80', spo2: '98', respRate: '16' };

                            return (
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-white p-2.5 rounded-xl border border-theme-dark/5">
                                  <span className="text-[10px] text-theme-dark/50 uppercase font-bold block flex items-center justify-center gap-1">
                                    <Heart className="w-3 h-3 text-red-500" /> HR
                                  </span>
                                  <span className="text-lg font-black font-mono text-red-500">{v.hr} <span className="text-[10px] font-sans">bpm</span></span>
                                </div>
                                <div className="bg-white p-2.5 rounded-xl border border-theme-dark/5">
                                  <span className="text-[10px] text-theme-dark/50 uppercase font-bold block">BP</span>
                                  <span className="text-lg font-black font-mono text-blue-600">{v.bp}</span>
                                </div>
                                <div className="bg-white p-2.5 rounded-xl border border-theme-dark/5">
                                  <span className="text-[10px] text-theme-dark/50 uppercase font-bold block flex items-center justify-center gap-1">
                                    <Droplet className="w-3 h-3 text-teal-500" /> SpO2
                                  </span>
                                  <span className="text-lg font-black font-mono text-teal-600">{v.spo2}%</span>
                                </div>
                                <div className="bg-white p-2.5 rounded-xl border border-theme-dark/5">
                                  <span className="text-[10px] text-theme-dark/50 uppercase font-bold block">Resp Rate</span>
                                  <span className="text-lg font-black font-mono text-theme-dark">{v.respRate || '--'}</span>
                                </div>
                              </div>
                            );
                          })()}

                          <div className="text-[10px] text-theme-dark/40 text-right mt-2">
                            {emergency.vitalsLog?.length ? `${emergency.vitalsLog.length} readings streamed` : 'Intake telemetry synchronized'}
                          </div>
                        </div>

                        {/* Column 3: Logistics & Hospital Action Panel */}
                        <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider mb-2">
                              Destination & ETA
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-theme-dark/5 mb-3">
                              <div className="text-xs text-theme-dark/70 font-medium">Estimated Arrival:</div>
                              <div className="text-xl font-black text-theme-dark flex items-center gap-1.5">
                                <Navigation className="w-4 h-4 text-theme-dark" />
                                {currentHospital?.eta || '8 - 12 mins'}
                              </div>
                            </div>

                            {/* Care Facility Allocation info */}
                            <div className="bg-white p-3 rounded-xl border border-theme-dark/5 mb-3">
                              <div className="text-[10px] text-theme-dark/50 uppercase font-bold mb-1">Care Facility Allocation:</div>
                              <div className="text-xs font-bold text-theme-dark flex items-center justify-between">
                                <span>Requested: <strong className={emergency.requiredBedType === 'ICU' ? 'text-red-600' : 'text-blue-600'}>{emergency.requiredBedType === 'ICU' ? '⚡ ICU Bed' : '🛏️ Normal Bed'}</strong></span>
                                <span className="text-theme-dark/60">
                                  Available: <strong className="text-theme-dark">{emergency.requiredBedType === 'ICU' ? capacityForm.availableIcuBeds : capacityForm.availableGeneralBeds}</strong>
                                </span>
                              </div>
                            </div>

                            {emergency.hospitalNotes && (
                              <div className="text-xs bg-slate-100 p-2.5 rounded-xl text-slate-700 italic border border-slate-200">
                                <strong>ER Note:</strong> "{emergency.hospitalNotes}"
                              </div>
                            )}
                          </div>

                          {/* ACTION BUTTONS (ACCEPT / REJECT) */}
                          <div className="mt-4 pt-3 border-t border-theme-dark/5">
                            {isPending ? (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleOpenActionModal(emergency, 'accepted')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <CheckCircle className="w-4 h-4" /> Accept Patient
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal(emergency, 'rejected')}
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <XCircle className="w-4 h-4" /> Divert / Reject
                                </button>
                              </div>
                            ) : isAccepted ? (
                              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-bold border border-emerald-200 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" /> ER Responding
                                </span>
                                <button
                                  onClick={() => handleOpenActionModal(emergency, 'rejected')}
                                  className="text-xs text-red-600 hover:underline font-semibold"
                                >
                                  Change to Divert
                                </button>
                              </div>
                            ) : (
                              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <XCircle className="w-4 h-4 text-red-600" /> Unit Diverted
                                </span>
                                <button
                                  onClick={() => handleOpenActionModal(emergency, 'accepted')}
                                  className="text-xs text-emerald-700 hover:underline font-semibold"
                                >
                                  Re-Accept
                                </button>
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CAPACITY & BLOOD BANK MANAGEMENT (MANUAL UPDATE)   */}
        {/* ======================================================== */}
        {activeTab === 'capacity' && (
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-theme-dark/10">
                <div>
                  <h2 className="text-2xl font-bold text-theme-dark">
                    Resource & Bed Capacity Controls
                  </h2>
                  <p className="text-sm text-theme-dark/60">
                    Live telemetry published to all field EMTs and Dispatch Coordinators. Updates persist directly in MongoDB.
                  </p>
                </div>
                <div className="text-xs font-bold bg-theme-bg px-3.5 py-2 rounded-xl text-theme-dark/70 border border-theme-dark/5">
                  Last Updated: {currentHospital?.lastUpdated ? new Date(currentHospital.lastUpdated).toLocaleTimeString() : 'Just now'}
                </div>
              </div>

              {saveMessage && (
                <div className={`p-4 rounded-xl text-sm font-bold mb-6 border ${
                  saveMessage.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' :
                  saveMessage.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {saveMessage}
                </div>
              )}

              <form onSubmit={handleSaveCapacity} className="space-y-8">
                
                {/* 1. Bed Management Controls */}
                <div>
                  <h3 className="text-lg font-bold text-theme-dark mb-4 flex items-center gap-2">
                    <Bed className="w-5 h-5 text-blue-600" /> Emergency Bed Inventory
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* General Beds */}
                    <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-theme-dark">General Ward Beds</span>
                        <span className="text-xs font-bold text-theme-dark/50">Occupancy: {capacityForm.totalGeneralBeds - capacityForm.availableGeneralBeds} occupied</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-theme-dark/60 uppercase block mb-1">Available Beds</label>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => adjustValue('availableGeneralBeds', -1, 0, capacityForm.totalGeneralBeds)}
                              className="w-10 h-10 rounded-xl bg-white border border-theme-dark/10 flex items-center justify-center font-bold text-lg hover:bg-slate-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input 
                              type="number" 
                              value={capacityForm.availableGeneralBeds}
                              onChange={(e) => setCapacityForm({...capacityForm, availableGeneralBeds: Number(e.target.value)})}
                              className="w-full bg-white border border-theme-dark/10 text-center font-black text-lg py-2 rounded-xl outline-none"
                              min="0"
                            />
                            <button 
                              type="button" 
                              onClick={() => adjustValue('availableGeneralBeds', 1, 0, capacityForm.totalGeneralBeds)}
                              className="w-10 h-10 rounded-xl bg-white border border-theme-dark/10 flex items-center justify-center font-bold text-lg hover:bg-slate-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-theme-dark/60 uppercase block mb-1">Total Capacity</label>
                          <input 
                            type="number" 
                            value={capacityForm.totalGeneralBeds}
                            onChange={(e) => setCapacityForm({...capacityForm, totalGeneralBeds: Number(e.target.value)})}
                            className="w-full bg-white border border-theme-dark/10 text-center font-bold text-lg py-2 rounded-xl outline-none h-10 mt-0.5"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ICU Beds */}
                    <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-theme-dark flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-red-500" /> Intensive Care (ICU)
                        </span>
                        <span className="text-xs font-bold text-theme-dark/50">Ventilator Equipped</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-theme-dark/60 uppercase block mb-1">Available ICU Beds</label>
                          <div className="flex items-center gap-2">
                            <button 
                              type="button" 
                              onClick={() => adjustValue('availableIcuBeds', -1, 0, capacityForm.totalIcuBeds)}
                              className="w-10 h-10 rounded-xl bg-white border border-theme-dark/10 flex items-center justify-center font-bold text-lg hover:bg-slate-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input 
                              type="number" 
                              value={capacityForm.availableIcuBeds}
                              onChange={(e) => setCapacityForm({...capacityForm, availableIcuBeds: Number(e.target.value)})}
                              className="w-full bg-white border border-theme-dark/10 text-center font-black text-lg py-2 rounded-xl outline-none"
                              min="0"
                            />
                            <button 
                              type="button" 
                              onClick={() => adjustValue('availableIcuBeds', 1, 0, capacityForm.totalIcuBeds)}
                              className="w-10 h-10 rounded-xl bg-white border border-theme-dark/10 flex items-center justify-center font-bold text-lg hover:bg-slate-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-theme-dark/60 uppercase block mb-1">Total ICU Capacity</label>
                          <input 
                            type="number" 
                            value={capacityForm.totalIcuBeds}
                            onChange={(e) => setCapacityForm({...capacityForm, totalIcuBeds: Number(e.target.value)})}
                            className="w-full bg-white border border-theme-dark/10 text-center font-bold text-lg py-2 rounded-xl outline-none h-10 mt-0.5"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. ER Operational Status */}
                <div>
                  <h3 className="text-lg font-bold text-theme-dark mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-600" /> ER Operational Level
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Operational', 'Beds Full', 'Critical Diversion'].map(statusOption => {
                      const isSelected = capacityForm.status === statusOption;
                      return (
                        <div
                          key={statusOption}
                          onClick={() => setCapacityForm({...capacityForm, status: statusOption})}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? (statusOption === 'Operational' ? 'border-green-500 bg-green-50' : statusOption === 'Beds Full' ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50') 
                              : 'border-theme-dark/10 hover:border-theme-dark/30 bg-theme-bg'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-theme-dark">{statusOption}</div>
                            <div className="text-[10px] text-theme-dark/60">
                              {statusOption === 'Operational' ? 'Accepting all traumas' :
                               statusOption === 'Beds Full' ? 'General capacity reached' : 'Extreme diversion required'}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${isSelected ? 'border-theme-dark bg-theme-dark' : 'border-slate-300'}`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Blood Bank Reserve Stock Grid */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-theme-dark flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-red-500" /> Blood Bank Reserves (Units in Stock)
                    </h3>
                    <span className="text-xs text-theme-dark/60 font-semibold">Updated manually by Blood Bank staff</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { key: 'A_pos', label: 'A+' },
                      { key: 'A_neg', label: 'A-' },
                      { key: 'B_pos', label: 'B+' },
                      { key: 'B_neg', label: 'B-' },
                      { key: 'O_pos', label: 'O+' },
                      { key: 'O_neg', label: 'O-' },
                      { key: 'AB_pos', label: 'AB+' },
                      { key: 'AB_neg', label: 'AB-' }
                    ].map(item => {
                      const units = capacityForm.bloodBank?.[item.key] ?? 0;
                      const isLow = units < 5;
                      const isCritical = units <= 2;

                      return (
                        <div key={item.key} className="bg-theme-bg p-4 rounded-2xl border border-theme-dark/5 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-2">
                            <span className="w-8 h-8 rounded-xl bg-red-100 text-red-600 font-black text-sm flex items-center justify-center">
                              {item.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCritical ? 'bg-red-200 text-red-800' :
                              isLow ? 'bg-amber-100 text-amber-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {isCritical ? 'Critical' : isLow ? 'Low' : 'Adequate'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => adjustBloodUnit(item.key, -1)}
                              className="w-8 h-8 rounded-lg bg-white border border-theme-dark/10 flex items-center justify-center font-bold hover:bg-slate-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              value={units}
                              onChange={(e) => setCapacityForm({
                                ...capacityForm,
                                bloodBank: {
                                  ...capacityForm.bloodBank,
                                  [item.key]: Number(e.target.value)
                                }
                              })}
                              className="w-full text-center bg-white border border-theme-dark/10 py-1 rounded-lg font-mono font-bold text-sm outline-none"
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={() => adjustBloodUnit(item.key, 1)}
                              className="w-8 h-8 rounded-lg bg-white border border-theme-dark/10 flex items-center justify-center font-bold hover:bg-slate-100"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-theme-dark/10">
                  <button
                    type="submit"
                    className="w-full bg-theme-dark hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-base transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <Save className="w-5 h-5 text-theme-accentYellow" /> Save Hospital Capacity & Blood Stock to Database
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: LIVE INBOUND MAP                                  */}
        {/* ======================================================== */}
        {activeTab === 'map' && currentHospital && (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-theme-dark/5 flex-1 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-theme-dark">Live ER Radar & Incoming Units</h2>
                <p className="text-xs text-theme-dark/60">Ambulances currently en route to {currentHospital.name}</p>
              </div>
              <div className="text-xs font-bold bg-theme-bg px-3 py-1.5 rounded-full border border-theme-dark/5">
                Hospital GPS: {currentHospital.location?.lat.toFixed(4)}, {currentHospital.location?.lng.toFixed(4)}
              </div>
            </div>

            <div className="w-full flex-1 rounded-2xl overflow-hidden border border-theme-dark/10 relative min-h-[420px]">
              <MapContainer 
                center={[currentHospital.location.lat, currentHospital.location.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', minHeight: '420px' }}
                zoomControl={true}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Hospital Marker */}
                <Marker position={[currentHospital.location.lat, currentHospital.location.lng]}>
                  <Popup>
                    <strong>🏥 {currentHospital.name}</strong><br />
                    {currentHospital.type}<br />
                    Available Beds: {capacityForm.availableGeneralBeds}
                  </Popup>
                </Marker>

                {/* Markers for inbound emergencies */}
                {incomingEmergencies.map((em) => {
                  if (!em.location || !em.location.lat) return null;
                  return (
                    <React.Fragment key={em._id}>
                      <Marker position={[em.location.lat, em.location.lng]}>
                        <Popup>
                          <strong>🚑 Ambulance {em.assignedAmbulance || em.emergencyCode}</strong><br />
                          Patient: {em.patientName}<br />
                          Complaint: {em.chiefComplaint}<br />
                          Status: {em.hospitalStatus || 'pending'}
                        </Popup>
                      </Marker>
                      <Polyline 
                        positions={[
                          [em.location.lat, em.location.lng],
                          [currentHospital.location.lat, currentHospital.location.lng]
                        ]}
                        color={em.hospitalStatus === 'accepted' ? '#10b981' : '#f59e0b'}
                        weight={4}
                        dashArray="8, 8"
                      />
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

      </main>

      {/* --- CONFIRMATION MODAL FOR ACCEPT / REJECT ACTION --- */}
      {activeActionModal && (
        <div className="fixed inset-0 bg-theme-dark/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-theme-dark/10">
            <div className="flex items-center gap-3 mb-4">
              {activeActionModal.action === 'accepted' ? (
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-theme-dark">
                  {activeActionModal.action === 'accepted' ? 'Accept Incoming Patient' : 'Divert / Reject Transfer'}
                </h3>
                <p className="text-xs text-theme-dark/60">
                  {activeActionModal.action === 'accepted'
                    ? 'Notify EMT that ER trauma team & bed are prepared.'
                    : 'Notify EMT that beds are unavailable and diversion is requested.'}
                </p>
              </div>
            </div>

            {/* Bed Accounting Indicator */}
            {activeActionModal.action === 'accepted' ? (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Bed className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Automatic Bed Allocation:</strong> Will decrement <strong>1 {activeActionModal.emergency.requiredBedType === 'ICU' ? 'ICU Bed' : 'Normal Bed'}</strong> from {currentHospital?.name}. (Available now: {activeActionModal.emergency.requiredBedType === 'ICU' ? capacityForm.availableIcuBeds : capacityForm.availableGeneralBeds})
                </span>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong>Diversion Notice:</strong> Patient will be notified to reroute. Any reserved bed will be released.
                </span>
              </div>
            )}

            <div className="mb-6">
              <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider block mb-1.5">
                ER Dispatcher Note (Seen by field EMT):
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows="3"
                className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm outline-none focus:border-theme-dark resize-none font-medium"
                placeholder="Enter trauma bay number, equipment reserved, or diversion reason..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isSubmittingAction}
                className={`w-full text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-1.5 ${
                  activeActionModal.action === 'accepted' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmittingAction ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : activeActionModal.action === 'accepted' ? (
                  'Confirm Acceptance'
                ) : (
                  'Confirm Diversion'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
