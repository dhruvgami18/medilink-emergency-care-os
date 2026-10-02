import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import SimulationModal from '../SimulationModal';

export default function HospitalNavbar({ erStatus, onStatusChange, hospitalName = "Metro Central Hospital", onSimulated }) {
  const navigate = useNavigate();
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Normal':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
      case 'Trauma Standby':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
      case 'Full Divert':
        return { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse' };
      default:
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
  };

  const currentBadge = getStatusBadge(erStatus || 'Normal');

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-theme-dark/95 backdrop-blur-md shadow-lg border-b border-white/10 py-3.5">
        <div className="w-[92%] max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-4">
          
          {/* Logo & Facility Details */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-2xl font-bold flex items-center gap-2 text-white hover:opacity-90 transition"
            >
              <span className="text-xl text-theme-accentYellow">✚</span> MediLink
            </button>
            <div className="hidden lg:block h-6 w-px bg-white/20"></div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">Hospital Role Portal</span>
              <span className="text-sm font-bold text-white tracking-tight">{hospitalName}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 p-1.5 rounded-full border border-white/10 text-xs font-semibold">
            <NavLink
              to="/hospital"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`
              }
            >
              ER Overview
            </NavLink>

            <NavLink
              to="/hospital/incoming"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`
              }
            >
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              Live PRP Feed
            </NavLink>

            <NavLink
              to="/hospital/resources"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`
              }
            >
              Beds & Blood Bank
            </NavLink>

            <NavLink
              to="/hospital/patients"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`
              }
            >
              Patient UHID Search
            </NavLink>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* ER Status Pill Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${currentBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${currentBadge.dot}`}></span>
                <span>ER: {erStatus || 'Normal'}</span>
                <span className="text-[10px] opacity-60">▼</span>
              </button>

              {isStatusMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-theme-dark/10 py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-theme-dark/40 uppercase">Toggle ER Readiness</div>
                  {['Normal', 'Trauma Standby', 'Full Divert'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        if (onStatusChange) onStatusChange(st);
                        setIsStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-theme-dark hover:bg-theme-bg flex items-center justify-between"
                    >
                      <span>{st}</span>
                      {erStatus === st && <span className="text-emerald-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Viva Emergency Simulator Trigger */}
            <button
              onClick={() => setIsSimOpen(true)}
              className="bg-theme-accentYellow text-theme-dark px-3.5 py-1.5 rounded-full text-xs font-bold hover:scale-[1.03] transition flex items-center gap-1.5 shadow-sm"
              title="Click to simulate an incoming ambulance for faculty demo"
            >
              <span>⚡</span> Simulate Inbound
            </button>

            {/* Role Switcher to Admin */}
            <button
              onClick={() => navigate('/admin')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium transition"
              title="Switch to Admin role pages"
            >
              Switch to Admin ➔
            </button>
          </div>

        </div>
      </nav>

      {/* Simulator Modal */}
      <SimulationModal
        isOpen={isSimOpen}
        onClose={() => setIsSimOpen(false)}
        onSimulated={(newEmergency) => {
          if (onSimulated) onSimulated(newEmergency);
        }}
      />
    </>
  );
}
