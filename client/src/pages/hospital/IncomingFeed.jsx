import React, { useState, useEffect } from 'react';
import HospitalNavbar from '../../components/layout/HospitalNavbar';
import { fetchIncomingEmergencies, acceptEmergencyCase } from '../../services/hospitalService';
import SimulationModal from '../../components/SimulationModal';

export default function IncomingFeed() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Form state for acceptance
  const [bedNumber, setBedNumber] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. ER Duty Officer');
  const [toast, setToast] = useState('');

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await fetchIncomingEmergencies('default');
      setEmergencies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 6000);
    return () => clearInterval(interval);
  }, []);

  const openAcceptModal = (emg) => {
    setSelectedCase(emg);
    const pref = emg.prp?.requiredBedType || 'ICU';
    setBedNumber(`${pref}-${Math.floor(10 + Math.random() * 89)}`);
    setIsAcceptModalOpen(true);
  };

  const handleConfirmAccept = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setAccepting(true);
    try {
      await acceptEmergencyCase(selectedCase._id, {
        allocatedBed: bedNumber,
        attendingDoctor: doctorName,
        bedType: selectedCase.prp?.requiredBedType || 'ICU',
      });
      setToast(`Case accepted! Bed ${bedNumber} reserved and trauma team alerted.`);
      setIsAcceptModalOpen(false);
      loadFeed();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to accept case');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <HospitalNavbar onSimulated={() => loadFeed()} />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
              Pre-Hospital Intelligence
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              Inbound Ambulances & Live PRP Feed
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Real-time Patient Requirement Profiles (PRP) and streaming in-transit vitals from incoming EMTs.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsSimModalOpen(true)}
              className="bg-theme-accentYellow text-theme-dark font-bold text-xs px-4 py-2.5 rounded-full hover:scale-[1.02] shadow-sm transition flex items-center gap-2"
            >
              <span>⚡</span> Simulate Incoming Patient
            </button>
            <button
              onClick={loadFeed}
              className="bg-white border border-theme-dark/15 text-theme-dark font-bold text-xs px-4 py-2.5 rounded-full hover:bg-theme-cardGrey/30 transition flex items-center gap-1.5"
            >
              <span>↻</span> Refresh
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-lg font-bold text-sm mb-6 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <span>✓</span> {toast}
            </div>
            <button onClick={() => setToast('')} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Feed Cards */}
        {loading && emergencies.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-theme-dark border-t-theme-accentYellow rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-bold text-theme-dark/60">Scanning for Inbound Ambulances...</p>
          </div>
        ) : emergencies.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-theme-dark/10 shadow-sm max-w-xl mx-auto my-12">
            <div className="text-5xl mb-3">🚨</div>
            <h2 className="text-xl font-bold text-theme-dark mb-1">No Active Inbound Emergencies</h2>
            <p className="text-xs text-theme-dark/60 mb-6">
              All assigned ambulances have arrived or no emergency is currently en route to your hospital.
            </p>
            <button
              onClick={() => setIsSimModalOpen(true)}
              className="bg-theme-dark text-white px-6 py-3 rounded-full text-xs font-bold hover:scale-[1.02] transition shadow-md"
            >
              Trigger Simulated ALS Ambulance (Viva Demo)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {emergencies.map((emg) => {
              const latestVitals = emg.prp?.vitalSigns?.[emg.prp.vitalSigns.length - 1] || {};
              const isAccepted = emg.status === 'accepted';

              return (
                <div
                  key={emg._id}
                  className={`bg-white rounded-[2rem] p-6 md:p-8 border shadow-sm transition-all ${
                    emg.triageScore === 'Red'
                      ? 'border-red-200 shadow-red-500/5'
                      : 'border-theme-dark/10'
                  }`}
                >
                  {/* Card Top Banner */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-theme-dark/10">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        emg.triageScore === 'Red'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-amber-400 text-theme-dark font-bold'
                      }`}>
                        Triage {emg.triageScore || 'Yellow'}
                      </span>
                      <span className="text-xs font-mono font-bold bg-theme-bg px-3 py-1 rounded-full text-theme-dark">
                        {emg.trackingCode}
                      </span>
                      <span className="text-xs text-theme-dark/60 font-medium">
                        Reported: {new Date(emg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Ambulance ETA: ~{emg.etaMinutes || 6} Mins
                      </div>
                      {isAccepted ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                          ✓ Bed Reserved ({emg.allocatedBed})
                        </span>
                      ) : (
                        <button
                          onClick={() => openAcceptModal(emg)}
                          className="bg-theme-dark text-white text-xs font-bold px-5 py-2 rounded-full hover:scale-[1.03] transition shadow-md"
                        >
                          Accept Case & Allocate Bed
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Patient & Clinical Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                    
                    {/* Column 1: Patient & Incident */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-theme-dark/50">Patient Details</div>
                        <h3 className="text-lg font-bold text-theme-dark">
                          {emg.patient?.name || 'Emergency Patient'}
                        </h3>
                        <p className="text-xs text-theme-dark/70 font-medium">
                          {emg.patient?.age || 'Unknown'} Years • {emg.patient?.gender || 'N/A'} • Blood Group: <strong>{emg.prp?.bloodRequired?.bloodGroup || 'O+'}</strong>
                        </p>
                      </div>

                      <div className="bg-theme-bg/60 p-4 rounded-2xl border border-theme-dark/5">
                        <div className="text-[11px] font-bold uppercase text-theme-dark/50 mb-1">Suspected Diagnosis</div>
                        <div className="text-xs font-bold text-theme-dark leading-snug">
                          {emg.prp?.suspectedCondition || 'Acute Emergency Trauma'}
                        </div>
                        <div className="text-[11px] text-theme-dark/60 mt-1">
                          {emg.patient?.symptoms?.join(', ') || 'Chest pain, distress'}
                        </div>
                      </div>

                      <div className="text-xs text-theme-dark/70">
                        <div><strong>Ambulance Unit:</strong> {emg.assignedAmbulance?.vehicleNumber || 'ALS-101'} ({emg.assignedAmbulance?.type || 'ALS'})</div>
                        <div><strong>Driver / Paramedic:</strong> {emg.assignedAmbulance?.paramedicName || 'Sunita Sharma'} ({emg.assignedAmbulance?.driverPhone || '+91 98110 12345'})</div>
                      </div>
                    </div>

                    {/* Column 2: In-Transit Streaming Vitals */}
                    <div className="bg-theme-bg/40 p-5 rounded-2xl border border-theme-dark/10 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-theme-dark flex items-center gap-1.5">
                          <span className="text-red-500 animate-pulse">❤</span> Live In-Transit Vitals
                        </div>
                        <span className="text-[10px] text-theme-dark/50 font-mono">Stream: Active</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {/* Heart Rate */}
                        <div className="bg-white p-3 rounded-xl border border-theme-dark/5 shadow-xs">
                          <div className="text-[10px] font-bold text-theme-dark/50">HEART RATE</div>
                          <div className="text-2xl font-bold text-theme-dark flex items-baseline gap-1">
                            {latestVitals.heartRate || 108} <span className="text-[10px] font-medium text-theme-dark/50">bpm</span>
                          </div>
                        </div>

                        {/* Blood Pressure */}
                        <div className="bg-white p-3 rounded-xl border border-theme-dark/5 shadow-xs">
                          <div className="text-[10px] font-bold text-theme-dark/50">BLOOD PRESSURE</div>
                          <div className="text-xl font-bold text-theme-dark">
                            {latestVitals.bloodPressure || '145/92'}
                          </div>
                        </div>

                        {/* SpO2 */}
                        <div className="bg-white p-3 rounded-xl border border-theme-dark/5 shadow-xs">
                          <div className="text-[10px] font-bold text-theme-dark/50">SPO2 OXYGEN</div>
                          <div className={`text-2xl font-bold ${
                            (latestVitals.spO2 || 95) < 92 ? 'text-red-600' : 'text-emerald-700'
                          }`}>
                            {latestVitals.spO2 || 94}%
                          </div>
                        </div>

                        {/* GCS / Neuro */}
                        <div className="bg-white p-3 rounded-xl border border-theme-dark/5 shadow-xs">
                          <div className="text-[10px] font-bold text-theme-dark/50">GCS (COMA SCALE)</div>
                          <div className="text-xl font-bold text-theme-dark">
                            {latestVitals.gcs || 15} / 15
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-theme-dark/60 bg-white/60 p-2.5 rounded-xl border border-theme-dark/5 italic">
                        "{(latestVitals.notes) || 'Paramedic initiated high-flow supplemental oxygen. Patient responsive.'}"
                      </div>
                    </div>

                    {/* Column 3: Resource Preparation Checklist */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-theme-dark/50 mb-2">
                          Required Preparation
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-theme-dark/10">
                            <span className="font-medium text-theme-dark">Bed Allocation:</span>
                            <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                              {emg.prp?.requiredBedType || 'ICU'} Bed Required
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-theme-dark/10">
                            <span className="font-medium text-theme-dark">Equipment:</span>
                            <span className="font-bold text-theme-dark text-right">
                              {emg.prp?.equipmentNeeded?.join(', ') || 'Ventilator, Defibrillator'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-theme-dark/10">
                            <span className="font-medium text-theme-dark">Blood Bank Standby:</span>
                            <span className="font-bold text-theme-dark">
                              {emg.prp?.bloodRequired?.units || 1} Units of {emg.prp?.bloodRequired?.bloodGroup || 'O+'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex gap-2 pt-2">
                        {isAccepted ? (
                          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold text-center">
                            Assigned to: {emg.attendingDoctor || 'Dr. ER Duty Officer'} (Bed: {emg.allocatedBed})
                          </div>
                        ) : (
                          <button
                            onClick={() => openAcceptModal(emg)}
                            className="w-full bg-theme-dark text-white font-bold py-3 rounded-2xl text-xs hover:bg-theme-dark/90 transition shadow-sm"
                          >
                            Accept Case & Allocate Bed ➔
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Bed Allocation Modal */}
      {isAcceptModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-theme-dark/10">
            <h2 className="text-2xl font-bold text-theme-dark mb-1">Confirm Case & Reserve Bed</h2>
            <p className="text-xs text-theme-dark/60 mb-5">
              Case {selectedCase.trackingCode} • {selectedCase.patient?.name}
            </p>

            <form onSubmit={handleConfirmAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">
                  Required Bed Type
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedCase.prp?.requiredBedType || 'ICU'}
                  className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">
                  Allocate Bed Number
                </label>
                <input
                  type="text"
                  required
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  placeholder="e.g. ICU-04, GENERAL-12"
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">
                  Assign Attending ER Physician
                </label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="flex-1 py-3 rounded-full border border-theme-dark/20 text-xs font-bold text-theme-dark hover:bg-theme-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accepting}
                  className="flex-1 py-3 rounded-full bg-theme-dark text-white text-xs font-bold hover:scale-[1.02] shadow-md transition disabled:opacity-50"
                >
                  {accepting ? 'Allocating...' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onSimulated={() => loadFeed()}
      />

    </div>
  );
}
