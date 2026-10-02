import React, { useState, useEffect } from 'react';
import HospitalNavbar from '../../components/layout/HospitalNavbar';
import { searchPatientHistory } from '../../services/hospitalService';

export default function PatientHistory() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSearch = async (searchTerm = '') => {
    setLoading(true);
    try {
      const data = await searchPatientHistory(searchTerm);
      setPatients(data);
      if (data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <HospitalNavbar />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
              Clinical Records & Triage
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              Patient Medical History & UHID Search
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Look up patient baselines, allergies, and prior emergency admissions to avoid contraindications.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-theme-dark/10 shadow-sm mb-8">
          <form onSubmit={onFormSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by UHID (e.g. UHID-2026-0041), Patient Name, or Phone..."
                className="w-full bg-theme-bg border border-theme-dark/15 rounded-full py-3.5 pl-6 pr-12 text-sm text-theme-dark placeholder:text-theme-dark/40 outline-none focus:border-theme-dark transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    handleSearch('');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-dark/40 hover:text-theme-dark font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-theme-dark text-white px-8 py-3.5 rounded-full text-sm font-bold hover:scale-[1.02] shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>🔍</span> Search Record
            </button>
          </form>
        </div>

        {/* Results Layout: Left List / Right Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Patient Directory List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-theme-dark/50 px-2">
              Patients Found ({patients.length})
            </div>

            {loading ? (
              <div className="text-center py-12 text-sm font-bold text-theme-dark/40">Searching records...</div>
            ) : patients.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-theme-dark/10 text-center text-xs text-theme-dark/50">
                No patient matches for "{query}".
              </div>
            ) : (
              patients.map((pat) => (
                <div
                  key={pat._id}
                  onClick={() => setSelectedPatient(pat)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedPatient?._id === pat._id
                      ? 'bg-theme-dark text-white shadow-md border-theme-dark'
                      : 'bg-white hover:bg-theme-bg border-theme-dark/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm">{pat.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedPatient?._id === pat._id ? 'bg-white/20 text-white' : 'bg-theme-bg text-theme-dark'
                    }`}>
                      {pat.bloodGroup}
                    </span>
                  </div>
                  <div className={`text-xs font-mono ${selectedPatient?._id === pat._id ? 'text-white/70' : 'text-theme-dark/60'}`}>
                    {pat.uhid}
                  </div>
                  <div className={`text-[11px] mt-1 ${selectedPatient?._id === pat._id ? 'text-white/60' : 'text-theme-dark/40'}`}>
                    {pat.age}y • {pat.gender} • {pat.phone}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Patient Comprehensive Clinical Record */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm space-y-6">
                
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-theme-dark/10">
                  <div>
                    <div className="inline-block bg-theme-accentBlue/40 px-3 py-0.5 rounded-full text-xs font-bold text-theme-dark mb-2">
                      {selectedPatient.uhid}
                    </div>
                    <h2 className="text-3xl font-bold text-theme-dark">{selectedPatient.name}</h2>
                    <p className="text-xs text-theme-dark/60 mt-1">
                      {selectedPatient.age} Years Old • {selectedPatient.gender} • Contact: {selectedPatient.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-theme-dark/50 font-bold uppercase">Blood Group</div>
                    <div className="text-3xl font-black text-theme-dark">{selectedPatient.bloodGroup}</div>
                  </div>
                </div>

                {/* Critical Allergies & Chronic Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Allergies */}
                  <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
                    <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>⚠️</span> Known Drug & Clinical Allergies
                    </div>
                    {selectedPatient.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies.map((allg, idx) => (
                          <span key={idx} className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                            {allg}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-red-700/80 font-medium">No known clinical allergies on record.</div>
                    )}
                  </div>

                  {/* Chronic Conditions */}
                  <div className="p-4 rounded-2xl bg-theme-bg border border-theme-dark/10">
                    <div className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider mb-2">
                      Chronic Medical Conditions
                    </div>
                    {selectedPatient.chronicConditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.chronicConditions.map((cond, idx) => (
                          <span key={idx} className="bg-theme-dark text-white text-xs font-bold px-3 py-1 rounded-full">
                            {cond}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-theme-dark/60">No chronic medical conditions listed.</div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-2xl bg-theme-bg/50 border border-theme-dark/10">
                  <div className="text-xs font-bold text-theme-dark/50 uppercase tracking-wider mb-1">
                    Emergency Next of Kin Contact
                  </div>
                  <div className="text-sm font-bold text-theme-dark">
                    {selectedPatient.emergencyContact?.name || 'Emergency Contact'} ({selectedPatient.emergencyContact?.relation || 'Kin'})
                  </div>
                  <div className="text-xs text-theme-dark/60 font-medium">
                    Phone: {selectedPatient.emergencyContact?.phone || 'Not provided'}
                  </div>
                </div>

                {/* Clinical Notes */}
                {selectedPatient.medicalNotes && (
                  <div className="p-4 rounded-2xl bg-white border border-theme-dark/10">
                    <div className="text-xs font-bold text-theme-dark/50 uppercase tracking-wider mb-1">
                      Physician Case Notes
                    </div>
                    <p className="text-xs text-theme-dark/80 leading-relaxed">
                      {selectedPatient.medicalNotes}
                    </p>
                  </div>
                )}

                {/* Prior Emergencies Timeline */}
                <div>
                  <h3 className="text-base font-bold text-theme-dark mb-3">Prior Emergency Incident History</h3>
                  {selectedPatient.pastEmergencies?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedPatient.pastEmergencies.map((emg) => (
                        <div key={emg._id} className="p-3.5 rounded-xl border border-theme-dark/10 bg-theme-bg/30 text-xs">
                          <div className="flex justify-between font-bold text-theme-dark">
                            <span>Incident {emg.trackingCode}</span>
                            <span className="text-theme-dark/60">{new Date(emg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-theme-dark/70 mt-1">{emg.prp?.suspectedCondition || 'Emergency Admission'}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-theme-dark/50 italic bg-theme-bg/30 p-4 rounded-xl text-center">
                      No previous emergency hospitalizations on record for this patient.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-theme-dark/10 shadow-sm text-theme-dark/50">
                Select a patient from the left directory or search by UHID.
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
