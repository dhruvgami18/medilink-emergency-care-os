import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, 
  Activity, 
  Bed, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  LogOut, 
  RefreshCw, 
  ShieldCheck, 
  Radio, 
  Hospital as HospitalIcon, 
  FileText
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Active tab: 'overview', 'hospitals', 'ambulances', 'logs'
  const [activeTab, setActiveTab] = useState('overview');

  // Platform Metrics
  const [stats, setStats] = useState({
    totalEmergencies: 0,
    activeEmergencies: 0,
    completedEmergencies: 0,
    totalHospitals: 0,
    totalAmbulances: 0,
    totalGeneralBeds: 0,
    availableGeneralBeds: 0,
    totalIcuBeds: 0,
    availableIcuBeds: 0
  });

  // Entities Data
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [logs, setLogs] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  // Loading & Filter states
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [logSourceFilter, setLogSourceFilter] = useState('ALL');
  const [formFeedback, setFormFeedback] = useState({ type: '', message: '' });

  // Add Hospital Form
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    type: 'Multi-Specialty Trauma Care',
    address: 'Ahmedabad, Gujarat',
    contact: '+91 79 4000 0000',
    totalGeneralBeds: 50,
    availableGeneralBeds: 15,
    totalIcuBeds: 12,
    availableIcuBeds: 3,
    status: 'Operational',
    bloodBank: { A_pos: 10, A_neg: 3, B_pos: 12, B_neg: 2, O_pos: 15, O_neg: 4, AB_pos: 6, AB_neg: 1 }
  });

  // Add Ambulance Form
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [newAmbulance, setNewAmbulance] = useState({
    unitId: '',
    type: 'ALS',
    driverName: '',
    contact: '+91 98765 00000',
    baseStation: 'Ahmedabad Central Depot',
    status: 'Available'
  });

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const [statsRes, hospRes, ambRes, logsRes, emRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/stats`).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/hospitals`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/ambulances`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/admin/logs`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/emergencies`).catch(() => ({ data: [] }))
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (hospRes.data) setHospitals(hospRes.data);
      if (ambRes.data) setAmbulances(ambRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (emRes.data) setEmergencies(emRes.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  };

  // 2. Submit New Hospital
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospital.name) {
      alert("Hospital name is required");
      return;
    }
    try {
      await axios.post(`${API_BASE}/hospitals`, newHospital);
      setFormFeedback({ type: 'success', message: `✅ ${newHospital.name} successfully registered!` });
      setShowHospitalModal(false);
      setNewHospital({
        name: '',
        type: 'Multi-Specialty Trauma Care',
        address: 'Ahmedabad, Gujarat',
        contact: '+91 79 4000 0000',
        totalGeneralBeds: 50,
        availableGeneralBeds: 15,
        totalIcuBeds: 12,
        availableIcuBeds: 3,
        status: 'Operational',
        bloodBank: { A_pos: 10, A_neg: 3, B_pos: 12, B_neg: 2, O_pos: 15, O_neg: 4, AB_pos: 6, AB_neg: 1 }
      });
      setTimeout(() => setFormFeedback({ type: '', message: '' }), 4000);
      fetchAllData();
    } catch (err) {
      console.error("Error creating hospital:", err);
      alert(err.response?.data?.error || "Failed to create hospital.");
    }
  };

  // 3. Submit New Ambulance
  const handleCreateAmbulance = async (e) => {
    e.preventDefault();
    if (!newAmbulance.unitId) {
      alert("Ambulance Unit ID is required (e.g. Unit-99)");
      return;
    }
    try {
      await axios.post(`${API_BASE}/ambulances`, newAmbulance);
      setFormFeedback({ type: 'success', message: `✅ Ambulance ${newAmbulance.unitId} commissioned into fleet!` });
      setShowAmbulanceModal(false);
      setNewAmbulance({
        unitId: '',
        type: 'ALS',
        driverName: '',
        contact: '+91 98765 00000',
        baseStation: 'Ahmedabad Central Depot',
        status: 'Available'
      });
      setTimeout(() => setFormFeedback({ type: '', message: '' }), 4000);
      fetchAllData();
    } catch (err) {
      console.error("Error creating ambulance:", err);
      alert(err.response?.data?.error || "Failed to add ambulance.");
    }
  };

  // 4. Delete Ambulance
  const handleDeleteAmbulance = async (ambId, unitId) => {
    if (!window.confirm(`Are you sure you want to decommission ${unitId}?`)) return;
    try {
      await axios.delete(`${API_BASE}/ambulances/${ambId}`);
      setFormFeedback({ type: 'info', message: `Ambulance ${unitId} removed from fleet.` });
      setTimeout(() => setFormFeedback({ type: '', message: '' }), 3000);
      fetchAllData();
    } catch (err) {
      console.error("Delete ambulance error:", err);
      alert("Failed to delete ambulance.");
    }
  };

  // 5. Delete Hospital
  const handleDeleteHospital = async (hospId, hospName) => {
    if (!window.confirm(`Are you sure you want to remove ${hospName}?`)) return;
    try {
      await axios.delete(`${API_BASE}/hospitals/${hospId}`);
      setFormFeedback({ type: 'info', message: `Hospital ${hospName} removed successfully.` });
      setTimeout(() => setFormFeedback({ type: '', message: '' }), 3000);
      fetchAllData();
    } catch (err) {
      console.error("Delete hospital error:", err);
      alert(err.response?.data?.error || "Failed to delete hospital.");
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.emergencyCode && log.emergencyCode.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.patientName && log.patientName.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.event && log.event.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.hospital && log.hospital.toLowerCase().includes(logSearch.toLowerCase()));
    
    const matchesSource = 
      logSourceFilter === 'ALL' ||
      (log.source && log.source.toLowerCase().includes(logSourceFilter.toLowerCase()));

    return matchesSearch && matchesSource;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center font-sans text-theme-dark">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-theme-dark/5 flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-theme-dark" />
          <span className="font-bold text-sm">Connecting to MediLink Central Command...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark flex flex-col">
      
      {/* --- TOP ADMIN NAVBAR --- */}
      <header className="bg-theme-dark text-white px-6 py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Portal Identifier */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-theme-accentYellow text-theme-dark flex items-center justify-center font-bold text-xl">
              🛡️
            </div>
            <div>
              <div className="text-xl font-bold flex items-center gap-2">
                MediLink <span className="text-theme-accentYellow text-sm font-semibold uppercase tracking-wider px-2 py-0.5 bg-white/10 rounded-full">Admin Command Center</span>
              </div>
              <p className="text-xs text-white/60">System Oversight, Infrastructure & Fleet Orchestration</p>
            </div>
          </div>

          {/* Admin Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-xs font-semibold text-white/80 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-theme-accentYellow" />
              <span>Admin Access Only</span>
            </div>

            <button
              onClick={() => fetchAllData(true)}
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

      {/* --- NOTIFICATION BANNER --- */}
      {formFeedback.message && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{formFeedback.message}</span>
          </div>
        </div>
      )}

      {/* --- AGGREGATE SYSTEM METRICS BAR --- */}
      <div className="bg-white border-b border-theme-dark/10 shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-dark/5">
            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider block">Emergencies</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-theme-dark">{stats.totalEmergencies}</span>
              <span className="text-[10px] text-amber-600 font-bold">({stats.activeEmergencies} Active)</span>
            </div>
          </div>

          <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-dark/5">
            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider block">Hospitals</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-theme-dark">{hospitals.length}</span>
              <span className="text-[10px] text-green-600 font-bold">Partners</span>
            </div>
          </div>

          <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-dark/5">
            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider block">Ambulances</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-theme-dark">{ambulances.length}</span>
              <span className="text-[10px] text-blue-600 font-bold">In Fleet</span>
            </div>
          </div>

          <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-dark/5">
            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider block flex items-center gap-1">
              <Bed className="w-3 h-3 text-blue-600" /> General Beds
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-blue-600">{stats.availableGeneralBeds}</span>
              <span className="text-[10px] text-theme-dark/50">/ {stats.totalGeneralBeds} Open</span>
            </div>
          </div>

          <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-dark/5">
            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider block flex items-center gap-1">
              <Activity className="w-3 h-3 text-red-600" /> ICU Beds
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-red-600">{stats.availableIcuBeds}</span>
              <span className="text-[10px] text-theme-dark/50">/ {stats.totalIcuBeds} Open</span>
            </div>
          </div>

          <div className="bg-theme-bg p-3.5 rounded-2xl border border-theme-dark/5">
            <span className="text-[10px] font-bold text-theme-dark/50 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-600" /> System Status
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-theme-dark">100% Online</span>
            </div>
          </div>

        </div>
      </div>

      {/* --- MAIN ADMIN CONTENT --- */}
      <main className="max-w-7xl mx-auto w-full p-4 md:p-6 flex-1 flex flex-col">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pb-4 mb-4 border-b border-theme-dark/10 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-theme-dark text-white shadow-md' : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
              }`}
            >
              <Radio className="w-4 h-4 text-theme-accentYellow" />
              Live Incidents & Overview
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'hospitals' ? 'bg-theme-dark text-white shadow-md' : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-400" />
              Manage Hospitals ({hospitals.length})
            </button>

            <button
              onClick={() => setActiveTab('ambulances')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ambulances' ? 'bg-theme-dark text-white shadow-md' : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
              }`}
            >
              <HospitalIcon className="w-4 h-4 text-emerald-400" />
              Manage Ambulances ({ambulances.length})
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'logs' ? 'bg-theme-dark text-white shadow-md' : 'bg-white text-theme-dark/70 hover:bg-theme-dark/5'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-400" />
              System Audit Logs ({logs.length})
            </button>
          </div>

          {/* Quick Add Buttons on top right */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowHospitalModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hospital
            </button>
            <button
              onClick={() => setShowAmbulanceModal(true)}
              className="bg-theme-dark hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-theme-accentYellow" /> Add Ambulance
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW & ACTIVE INCIDENTS                       */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">Active Incident Feed</h2>
                <p className="text-sm text-theme-dark/60">Live cases dispatched across EMT ambulances and receiving hospital ERs.</p>
              </div>
              <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-full border border-theme-dark/10">
                {emergencies.length} Total Registered Cases
              </span>
            </div>

            <div className="bg-white rounded-[2rem] border border-theme-dark/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-theme-bg text-[10px] uppercase font-bold text-theme-dark/60 tracking-wider border-b border-theme-dark/5">
                    <tr>
                      <th className="py-4 px-6">Tracking Code</th>
                      <th className="py-4 px-6">Patient Name</th>
                      <th className="py-4 px-6">Care Level</th>
                      <th className="py-4 px-6">Assigned Ambulance</th>
                      <th className="py-4 px-6">Destination Hospital</th>
                      <th className="py-4 px-6">ER Status</th>
                      <th className="py-4 px-6">System Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-dark/5 font-medium">
                    {emergencies.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-theme-dark/50">No emergencies found.</td>
                      </tr>
                    ) : (
                      emergencies.map((em) => (
                        <tr key={em._id} className="hover:bg-slate-50 transition">
                          <td className="py-4 px-6 font-mono font-bold text-theme-dark">
                            {em.emergencyCode}
                          </td>
                          <td className="py-4 px-6 font-bold">
                            {em.patientName || 'Unknown Patient'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              em.requiredBedType === 'ICU' 
                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {em.requiredBedType === 'ICU' ? '⚡ ICU Bed' : '🛏️ Normal Bed'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {em.assignedAmbulance ? (
                              <span className="font-bold text-theme-dark flex items-center gap-1">
                                🚑 {em.assignedAmbulance}
                              </span>
                            ) : (
                              <span className="text-amber-600 text-xs font-semibold">Unassigned</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {em.destinationHospital?.name ? (
                              <span className="font-bold text-slate-800">
                                🏥 {em.destinationHospital.name}
                              </span>
                            ) : (
                              <span className="text-theme-dark/40 text-xs">Awaiting Route</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              em.hospitalStatus === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' :
                              em.hospitalStatus === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                              em.hospitalStatus === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {em.hospitalStatus === 'accepted' ? '✅ Accepted' :
                               em.hospitalStatus === 'rejected' ? '❌ Diverted' :
                               em.hospitalStatus === 'pending' ? '⏳ ER Decision Pending' : 'None'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs capitalize text-theme-dark/70">
                            {em.status.replace(/_/g, ' ')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MANAGE HOSPITALS                                  */}
        {/* ======================================================== */}
        {activeTab === 'hospitals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-bold mb-1">MediLink Partner Hospitals</h2>
                <p className="text-sm text-theme-dark/60">Registered trauma facilities, bed capacities, and real-time operational status.</p>
              </div>
              <button
                onClick={() => setShowHospitalModal(true)}
                className="bg-theme-dark hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-theme-accentYellow" /> Add New Hospital
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hospitals.map((hosp) => (
                <div key={hosp._id} className="bg-white rounded-2xl p-6 border border-theme-dark/5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-theme-dark">{hosp.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hosp.status === 'Operational' ? 'bg-green-100 text-green-700 border border-green-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {hosp.status || 'Operational'}
                      </span>
                    </div>

                    <p className="text-xs text-theme-dark/60 font-medium mb-1">{hosp.type}</p>
                    <p className="text-[11px] text-theme-dark/50 mb-4">{hosp.address}</p>

                    {/* Beds Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-theme-bg p-3 rounded-xl mb-4 border border-theme-dark/5 text-center">
                      <div>
                        <span className="text-[10px] font-bold text-theme-dark/50 uppercase block flex items-center justify-center gap-1">
                          <Bed className="w-3 h-3 text-blue-600" /> General Beds
                        </span>
                        <span className="text-base font-black text-theme-dark">
                          {hosp.availableGeneralBeds} <span className="text-[10px] text-theme-dark/50 font-normal">/ {hosp.totalGeneralBeds}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-theme-dark/50 uppercase block flex items-center justify-center gap-1">
                          <Activity className="w-3 h-3 text-red-600" /> ICU Beds
                        </span>
                        <span className="text-base font-black text-red-600">
                          {hosp.availableIcuBeds} <span className="text-[10px] text-theme-dark/50 font-normal">/ {hosp.totalIcuBeds}</span>
                        </span>
                      </div>
                    </div>

                    {/* Blood Bank Units */}
                    {hosp.bloodBank && (
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-theme-dark/50 uppercase block mb-1.5">Blood Bank Stock:</span>
                        <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
                          <div className="bg-slate-50 p-1 rounded border border-slate-100"><span className="text-[9px] text-theme-dark/50 block">A+</span><strong>{hosp.bloodBank.A_pos ?? '--'}</strong></div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-100"><span className="text-[9px] text-theme-dark/50 block">B+</span><strong>{hosp.bloodBank.B_pos ?? '--'}</strong></div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-100"><span className="text-[9px] text-theme-dark/50 block">O+</span><strong>{hosp.bloodBank.O_pos ?? '--'}</strong></div>
                          <div className="bg-slate-50 p-1 rounded border border-slate-100"><span className="text-[9px] text-theme-dark/50 block">AB+</span><strong>{hosp.bloodBank.AB_pos ?? '--'}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-theme-dark/5 flex justify-between items-center text-xs text-theme-dark/60">
                    <span>Contact: {hosp.contact || '+91 79 0000 0000'}</span>
                    <button
                      onClick={() => handleDeleteHospital(hosp._id, hosp.name)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 font-bold text-xs"
                      title="Remove Hospital"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MANAGE AMBULANCES                                 */}
        {/* ======================================================== */}
        {activeTab === 'ambulances' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-2xl font-bold mb-1">Ambulance Emergency Fleet</h2>
                <p className="text-sm text-theme-dark/60">ALS (Advanced Life Support) and BLS (Basic Life Support) mobile paramedic units.</p>
              </div>
              <button
                onClick={() => setShowAmbulanceModal(true)}
                className="bg-theme-dark hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 text-theme-accentYellow" /> Add New Unit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ambulances.map((amb) => (
                <div key={amb._id} className="bg-white rounded-2xl p-6 border border-theme-dark/5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚑</span>
                        <h3 className="font-mono font-black text-xl text-theme-dark">{amb.unitId}</h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        amb.type === 'ALS' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {amb.type} Unit
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-theme-dark/50">Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          amb.status === 'Available' ? 'bg-green-100 text-green-700' :
                          amb.status === 'Dispatched' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
                        }`}>
                          {amb.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-dark/50">Crew:</span>
                        <span className="font-bold text-theme-dark">{amb.driverName || 'EMT Crew'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-dark/50">Base Depot:</span>
                        <span className="font-bold text-theme-dark">{amb.baseStation || 'Central Depot'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-dark/50">Radio Contact:</span>
                        <span className="font-mono font-bold text-theme-dark">{amb.contact || '+91 98765 43210'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-theme-dark/5 flex justify-between items-center">
                    <span className="text-[11px] text-theme-dark/50 font-semibold">Registered Fleet Unit</span>
                    <button
                      onClick={() => handleDeleteAmbulance(amb._id, amb.unitId)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1 text-xs font-bold"
                      title="Decommission Unit"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Decommission
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SYSTEM AUDIT LOGS                                 */}
        {/* ======================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">System Audit & Activity Logs</h2>
                <p className="text-sm text-theme-dark/60">Chronological trail of emergency reporting, dispatch, telemetry streams, and ER decisions.</p>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-theme-dark/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs by code, event..."
                    className="w-full bg-white border border-theme-dark/10 rounded-xl pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-theme-dark"
                  />
                </div>

                <select
                  value={logSourceFilter}
                  onChange={(e) => setLogSourceFilter(e.target.value)}
                  className="bg-white border border-theme-dark/10 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="ALL">All Sources</option>
                  <option value="Dispatch">Dispatcher HQ</option>
                  <option value="Field EMT">Field EMT</option>
                  <option value="Hospital ER">Hospital ER Staff</option>
                  <option value="System">System</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-theme-dark/5 shadow-sm overflow-hidden p-6">
              <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-theme-dark/40 text-sm">No activity logs matching your filter criteria.</div>
                ) : (
                  filteredLogs.map((log, index) => (
                    <div key={log.id || index} className="p-4 bg-theme-bg rounded-xl border border-theme-dark/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-100 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-theme-dark/10 flex items-center justify-center shrink-0 mt-0.5">
                          {log.source?.includes('EMT') ? '🚑' :
                           log.source?.includes('Hospital') ? '🏥' :
                           log.source?.includes('Dispatch') ? '📡' : '⚙️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-theme-dark bg-white px-2 py-0.5 rounded border border-theme-dark/10">
                              {log.emergencyCode}
                            </span>
                            <span className="text-xs font-bold text-theme-dark/80">{log.event}</span>
                          </div>
                          <div className="text-[11px] text-theme-dark/60 flex flex-wrap gap-2">
                            <span>Source: <strong className="text-theme-dark">{log.source}</strong></span>
                            {log.patientName && <span>• Patient: <strong>{log.patientName}</strong></span>}
                            {log.hospital && <span>• Hospital: <strong>{log.hospital}</strong></span>}
                            {log.ambulance && <span>• Unit: <strong>{log.ambulance}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 text-xs text-theme-dark/50 font-mono">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL 1: ADD HOSPITAL --- */}
      {showHospitalModal && (
        <div className="fixed inset-0 bg-theme-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-theme-dark/10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-1 text-theme-dark">Register Partner Hospital</h3>
            <p className="text-xs text-theme-dark/60 mb-6">Add an emergency care facility to the MediLink regional network.</p>

            <form onSubmit={handleCreateHospital} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalby Specialty Hospital"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-semibold outline-none focus:border-theme-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Facility Type</label>
                  <select
                    value={newHospital.type}
                    onChange={(e) => setNewHospital({...newHospital, type: e.target.value})}
                    className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-xs font-bold outline-none"
                  >
                    <option>Level 1 Trauma Center</option>
                    <option>Cardiac Specialty</option>
                    <option>Level 2 Trauma Center</option>
                    <option>Multi-Specialty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={newHospital.contact}
                    onChange={(e) => setNewHospital({...newHospital, contact: e.target.value})}
                    className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Address / Location</label>
                <input
                  type="text"
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({...newHospital, address: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-semibold outline-none"
                />
              </div>

              {/* Beds Configuration */}
              <div className="grid grid-cols-2 gap-3 bg-theme-bg p-3.5 rounded-xl border border-theme-dark/5">
                <div>
                  <label className="text-[10px] font-bold text-theme-dark/60 block mb-1">General Beds (Total)</label>
                  <input
                    type="number"
                    value={newHospital.totalGeneralBeds}
                    onChange={(e) => setNewHospital({...newHospital, totalGeneralBeds: Number(e.target.value)})}
                    className="w-full bg-white border border-theme-dark/10 rounded-lg p-2 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-theme-dark/60 block mb-1">General Beds (Available)</label>
                  <input
                    type="number"
                    value={newHospital.availableGeneralBeds}
                    onChange={(e) => setNewHospital({...newHospital, availableGeneralBeds: Number(e.target.value)})}
                    className="w-full bg-white border border-theme-dark/10 rounded-lg p-2 text-sm font-bold outline-none text-green-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-theme-dark/60 block mb-1">ICU Beds (Total)</label>
                  <input
                    type="number"
                    value={newHospital.totalIcuBeds}
                    onChange={(e) => setNewHospital({...newHospital, totalIcuBeds: Number(e.target.value)})}
                    className="w-full bg-white border border-theme-dark/10 rounded-lg p-2 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-theme-dark/60 block mb-1">ICU Beds (Available)</label>
                  <input
                    type="number"
                    value={newHospital.availableIcuBeds}
                    onChange={(e) => setNewHospital({...newHospital, availableIcuBeds: Number(e.target.value)})}
                    className="w-full bg-white border border-theme-dark/10 rounded-lg p-2 text-sm font-bold outline-none text-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHospitalModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD AMBULANCE --- */}
      {showAmbulanceModal && (
        <div className="fixed inset-0 bg-theme-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-6 md:p-8 shadow-2xl border border-theme-dark/10">
            <h3 className="text-xl font-bold mb-1 text-theme-dark">Commission Ambulance Unit</h3>
            <p className="text-xs text-theme-dark/60 mb-6">Add a paramedic ambulance unit to the active emergency response fleet.</p>

            <form onSubmit={handleCreateAmbulance} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Ambulance Unit ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit-55"
                  value={newAmbulance.unitId}
                  onChange={(e) => setNewAmbulance({...newAmbulance, unitId: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-mono font-bold outline-none focus:border-theme-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Care Capability</label>
                  <select
                    value={newAmbulance.type}
                    onChange={(e) => setNewAmbulance({...newAmbulance, type: e.target.value})}
                    className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-xs font-bold outline-none"
                  >
                    <option value="ALS">ALS (Advanced Life Support)</option>
                    <option value="BLS">BLS (Basic Life Support)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Initial Status</label>
                  <select
                    value={newAmbulance.status}
                    onChange={(e) => setNewAmbulance({...newAmbulance, status: e.target.value})}
                    className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-xs font-bold outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Driver / Lead Paramedic</label>
                <input
                  type="text"
                  placeholder="e.g. Paramedic Vikram"
                  value={newAmbulance.driverName}
                  onChange={(e) => setNewAmbulance({...newAmbulance, driverName: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Base Station Depot</label>
                <input
                  type="text"
                  placeholder="e.g. Satellite Depot"
                  value={newAmbulance.baseStation}
                  onChange={(e) => setNewAmbulance({...newAmbulance, baseStation: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 uppercase block mb-1">Emergency Radio / Phone</label>
                <input
                  type="text"
                  value={newAmbulance.contact}
                  onChange={(e) => setNewAmbulance({...newAmbulance, contact: e.target.value})}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3 text-sm font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAmbulanceModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-theme-dark hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition"
                >
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
