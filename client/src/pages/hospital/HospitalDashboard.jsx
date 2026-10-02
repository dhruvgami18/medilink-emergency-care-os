import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalNavbar from '../../components/layout/HospitalNavbar';
import { fetchHospitalDashboard, updateERReadinessStatus } from '../../services/hospitalService';

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetchHospitalDashboard('default');
      setData(res);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not load hospital dashboard data. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // Auto refresh every 8 seconds for live ER updates
    const interval = setInterval(loadDashboard, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (!data?.hospital?._id) return;
    try {
      await updateERReadinessStatus(data.hospital._id, newStatus);
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-theme-dark border-t-theme-accentYellow rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-theme-dark font-bold text-lg">Connecting to ER Command Desk...</div>
        </div>
      </div>
    );
  }

  const hospital = data?.hospital;
  const stats = data?.stats;
  const incoming = data?.incomingEmergencies || [];
  const lowBlood = data?.lowBloodStock || [];

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <HospitalNavbar 
        erStatus={hospital?.erStatus} 
        onStatusChange={handleStatusChange}
        hospitalName={hospital?.name}
        onSimulated={() => loadDashboard()}
      />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Banner Section matching Urvi's Home.jsx Dark Card style */}
        <section className="bg-theme-dark rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-xl mb-8">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-white/20">
                <span className="text-theme-accentYellow">★</span> {hospital?.traumaLevel || 'Level 1 Trauma Center'}
              </div>
              <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-3">
                Emergency Readiness & Bed Command
              </h1>
              <p className="text-white/80 text-sm md:text-base font-light">
                {hospital?.name} — {hospital?.address}
              </p>
            </div>

            {/* Quick ER Status Toggle Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 w-full lg:w-auto shrink-0">
              <div className="text-xs uppercase font-bold tracking-wider text-white/60 mb-2">ER Readiness Mode</div>
              <div className="flex gap-2">
                {['Normal', 'Trauma Standby', 'Full Divert'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      hospital?.erStatus === st
                        ? 'bg-theme-accentYellow text-theme-dark shadow-md scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-sm font-bold mb-6">
            {error}
          </div>
        )}

        {/* Low Blood Warning Banner if any units <= 5 */}
        {lowBlood.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <span className="font-bold text-amber-900 text-sm">Low Blood Bank Alert: </span>
                <span className="text-amber-800 text-xs">
                  Critical shortage in units for: {lowBlood.map((b) => `${b.bloodGroup} (${b.units} units)`).join(', ')}.
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/hospital/resources')} 
              className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-amber-700 transition shrink-0"
            >
              Update Inventory
            </button>
          </div>
        )}

        {/* 4 Quick Stat Cards matching Urvi's aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          {/* Card 1: Incoming Inbound */}
          <div 
            onClick={() => navigate('/hospital/incoming')}
            className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/60">Inbound Ambulances</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            </div>
            <div className="text-4xl font-bold text-theme-dark group-hover:text-red-600 transition">
              {stats?.totalIncoming || 0}
            </div>
            <div className="text-xs text-theme-dark/60 mt-2 flex items-center justify-between">
              <span>{stats?.criticalCases || 0} Critical (Triage Red)</span>
              <span className="text-theme-dark font-bold group-hover:translate-x-1 transition">View ➔</span>
            </div>
          </div>

          {/* Card 2: ICU Bed Occupancy */}
          <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/60">Available ICU Beds</span>
              <span className="p-2 rounded-xl bg-theme-accentBlue/40 text-theme-dark text-xs font-bold">
                {hospital?.resources?.icuBeds?.available || 0} / {hospital?.resources?.icuBeds?.total || 0}
              </span>
            </div>
            <div className="text-4xl font-bold text-theme-dark">
              {hospital?.resources?.icuBeds?.available || 0}
            </div>
            <div className="w-full bg-theme-cardGrey rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="bg-theme-dark h-full rounded-full" 
                style={{ width: `${stats?.icuOccupancyPercent || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Available General Beds */}
          <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/60">General ER Beds</span>
              <span className="p-2 rounded-xl bg-theme-accentYellow/40 text-theme-dark text-xs font-bold">
                {hospital?.resources?.generalBeds?.available || 0} / {hospital?.resources?.generalBeds?.total || 0}
              </span>
            </div>
            <div className="text-4xl font-bold text-theme-dark">
              {hospital?.resources?.generalBeds?.available || 0}
            </div>
            <div className="w-full bg-theme-cardGrey rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${stats?.generalOccupancyPercent || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Card 4: Equipment Readiness */}
          <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/60">Life Support Assets</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-full">Ready</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-2xl font-bold text-theme-dark">{hospital?.resources?.ventilators?.available || 0}</div>
                <div className="text-[11px] text-theme-dark/60">Ventilators Free</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-dark">{hospital?.resources?.oxygenCylinders?.available || 0}</div>
                <div className="text-[11px] text-theme-dark/60">O2 Cylinders Free</div>
              </div>
            </div>
            <div className="text-[11px] text-theme-dark/40 mt-2">Checked in real-time</div>
          </div>

        </div>

        {/* Inbound Emergencies Preview Section */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
                Live Inbound Feed
              </div>
              <h2 className="text-2xl font-bold text-theme-dark">En Route Ambulances</h2>
            </div>
            <button
              onClick={() => navigate('/hospital/incoming')}
              className="bg-theme-dark text-white text-xs font-bold px-5 py-2.5 rounded-full hover:scale-[1.02] transition"
            >
              Open Full Live Triage Feed ➔
            </button>
          </div>

          {incoming.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-theme-dark/10 rounded-2xl">
              <div className="text-4xl mb-2">🚑</div>
              <div className="font-bold text-theme-dark text-base">No incoming emergencies right now</div>
              <p className="text-xs text-theme-dark/60 mt-1 mb-4">Click below to simulate an incoming ambulance with live vitals for your faculty demo.</p>
              <button
                onClick={() => navigate('/hospital/incoming')}
                className="bg-theme-accentYellow text-theme-dark px-4 py-2 rounded-full text-xs font-bold shadow-sm"
              >
                Go to Live PRP Feed
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incoming.map((emg) => (
                <div
                  key={emg._id}
                  onClick={() => navigate('/hospital/incoming')}
                  className="p-5 rounded-2xl border border-theme-dark/10 bg-theme-bg/50 hover:bg-theme-bg hover:border-theme-dark/20 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        emg.triageScore === 'Red'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        ● Triage {emg.triageScore || 'Yellow'}
                      </span>
                      <span className="text-xs font-mono font-bold text-theme-dark/60">{emg.trackingCode}</span>
                    </div>
                    <div className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                      ETA ~{emg.etaMinutes || 8} mins
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-theme-dark mb-1">
                    {emg.patient?.name || 'Emergency Patient'} ({emg.patient?.age || '?' }y, {emg.patient?.gender || 'N/A'})
                  </h3>
                  <p className="text-xs text-theme-dark/70 font-medium mb-3 line-clamp-1">
                    Condition: {emg.prp?.suspectedCondition || 'Acute Trauma'}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-theme-dark/10">
                    <span className="text-theme-dark/60">
                      Ambulance: <strong className="text-theme-dark">{emg.assignedAmbulance?.vehicleNumber || 'ALS-101'}</strong>
                    </span>
                    <span className="text-theme-dark/60">
                      Needs: <strong className="text-theme-dark">{emg.prp?.requiredBedType || 'ICU'} Bed</strong>
                    </span>
                    <span className="text-theme-dark font-bold">Review PRP ➔</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
