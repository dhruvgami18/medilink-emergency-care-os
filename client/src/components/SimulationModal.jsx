import React, { useState } from 'react';
import { triggerEmergencySimulation } from '../services/simulationService';

export default function SimulationModal({ isOpen, onClose, onSimulated, hospitalId }) {
  const [severity, setSeverity] = useState('Red');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await triggerEmergencySimulation(hospitalId, severity);
      setSuccessMsg(`Ambulance ${res.emergency?.assignedAmbulance?.vehicleNumber || 'ALS-101'} dispatched!`);
      if (onSimulated) onSimulated(res.emergency);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1400);
    } catch (err) {
      console.error(err);
      alert('Simulation failed to trigger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-theme-dark/10">
        <div className="flex justify-between items-center mb-5">
          <div className="inline-flex items-center gap-2 bg-theme-accentYellow/40 px-3 py-1 rounded-full text-xs font-bold text-theme-dark">
            <span>⚡</span> Faculty Viva Simulator
          </div>
          <button 
            onClick={onClose}
            className="text-theme-dark/40 hover:text-theme-dark text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-theme-cardGrey/40 transition"
          >
            ✕
          </button>
        </div>

        <h2 className="text-2xl font-bold text-theme-dark mb-2">Simulate Inbound Emergency</h2>
        <p className="text-sm text-theme-dark/70 mb-6">
          Generates a live emergency in MongoDB with real-time vitals and assigns an ALS ambulance en route to your ER desk.
        </p>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-bold mb-4 flex items-center gap-2">
            <span>✓</span> {successMsg}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-theme-dark/60">
            Select Triage Priority & Condition
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSeverity('Red')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                severity === 'Red'
                  ? 'border-red-500 bg-red-50/80 shadow-sm'
                  : 'border-theme-dark/10 bg-white hover:bg-theme-bg'
              }`}
            >
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                Triage RED
              </div>
              <div className="text-xs text-theme-dark/80 font-medium">Acute STEMI (Heart Attack)</div>
              <div className="text-[11px] text-theme-dark/50 mt-1">Requires ICU & Defibrillator</div>
            </button>

            <button
              type="button"
              onClick={() => setSeverity('Yellow')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                severity === 'Yellow'
                  ? 'border-amber-500 bg-amber-50/80 shadow-sm'
                  : 'border-theme-dark/10 bg-white hover:bg-theme-bg'
              }`}
            >
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Triage YELLOW
              </div>
              <div className="text-xs text-theme-dark/80 font-medium">Polytrauma / Fracture</div>
              <div className="text-[11px] text-theme-dark/50 mt-1">Requires General Bed & X-Ray</div>
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-full border border-theme-dark/15 text-sm font-bold text-theme-dark hover:bg-theme-cardGrey/30 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSimulate}
            className="flex-1 py-3.5 px-4 rounded-full bg-theme-dark text-white text-sm font-bold hover:scale-[1.02] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Dispatching...' : 'Dispatch Case'}
          </button>
        </div>
      </div>
    </div>
  );
}
