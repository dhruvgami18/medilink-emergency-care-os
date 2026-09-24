import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EMTDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('intake'); // intake, vitals, hospital, timeline
  const [syncStatus, setSyncStatus] = useState('Synced');

  // 1. Patient Intake Form with Local Storage Draft (Offline Support)
  const [intakeData, setIntakeData] = useState(() => {
    const saved = localStorage.getItem('medilink_emt_draft');
    return saved ? JSON.parse(saved) : {
      patientName: '',
      age: '',
      gender: 'Unknown',
      chiefComplaint: '',
      medicalHistory: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('medilink_emt_draft', JSON.stringify(intakeData));
    setSyncStatus('Draft Saved Locally');
    const timer = setTimeout(() => setSyncStatus('Synced'), 2000);
    return () => clearTimeout(timer);
  }, [intakeData]);

  const handleIntakeChange = (e) => {
    setIntakeData({ ...intakeData, [e.target.name]: e.target.value });
  };

  const handleGeneratePRP = (e) => {
    e.preventDefault();
    alert('Patient Requirement Profile (PRP) Generated and Sent to Matching Engine!');
    setActiveTab('vitals');
  };

  // 2. Live Vitals State
  const [vitals, setVitals] = useState({ hr: 85, bp: '120/80', spo2: 98 });
  const handlePushVitals = () => {
    setSyncStatus('Pushing Vitals...');
    setTimeout(() => {
      setSyncStatus('Vitals Streamed to Hospital');
      setTimeout(() => setSyncStatus('Synced'), 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark flex flex-col md:flex-row">
      
      {/* Mobile-First Sidebar / Header Nav */}
      <nav className="bg-theme-dark text-white w-full md:w-64 md:min-h-screen p-6 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
             <span className="text-theme-accentYellow">✚</span> EMT Console
          </div>
          
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            <TabButton name="intake" icon="📋" label="Intake Form" activeTab={activeTab} setTab={setActiveTab} />
            <TabButton name="vitals" icon="❤️" label="Live Vitals" activeTab={activeTab} setTab={setActiveTab} />
            <TabButton name="hospital" icon="🏥" label="Destination" activeTab={activeTab} setTab={setActiveTab} />
            <TabButton name="timeline" icon="⏱️" label="Timeline" activeTab={activeTab} setTab={setActiveTab} />
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Unit Status</div>
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-500/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Unit 42 - Active
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-theme-dark/5 mb-6">
          <div className="font-bold text-sm tracking-wider uppercase opacity-70">Case #EMG-9021</div>
          <div className="text-xs font-medium bg-theme-bg px-3 py-1.5 rounded-full text-theme-dark/70">
            {syncStatus}
          </div>
        </div>

        {/* TAB 1: Patient Intake Form */}
        {activeTab === 'intake' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5">
            <h2 className="text-2xl font-medium mb-6">Patient Requirement Profile (PRP)</h2>
            <form onSubmit={handleGeneratePRP} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Patient Name</label>
                  <input type="text" name="patientName" value={intakeData.patientName} onChange={handleIntakeChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark" placeholder="Unknown / John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Age</label>
                    <input type="number" name="age" value={intakeData.age} onChange={handleIntakeChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark" placeholder="e.g. 45" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Gender</label>
                    <select name="gender" value={intakeData.gender} onChange={handleIntakeChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark appearance-none">
                      <option>M</option><option>F</option><option>Other</option><option>Unknown</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Chief Complaint / Symptoms</label>
                <textarea name="chiefComplaint" value={intakeData.chiefComplaint} onChange={handleIntakeChange} rows="2" className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark resize-none" placeholder="Chest pain, shortness of breath..."></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Medical History / Allergies</label>
                <textarea name="medicalHistory" value={intakeData.medicalHistory} onChange={handleIntakeChange} rows="2" className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark resize-none" placeholder="History of hypertension, allergic to penicillin..."></textarea>
              </div>

              <button type="submit" className="w-full bg-theme-dark text-white font-medium py-3.5 rounded-xl mt-2 hover:bg-opacity-90 transition">
                Generate PRP & Find Hospital
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Live Vitals */}
        {activeTab === 'vitals' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5">
            <h2 className="text-2xl font-medium mb-2">Live Vitals Stream</h2>
            <p className="text-sm text-theme-dark/60 mb-8">Update current vitals to stream directly to the receiving hospital ER dashboard.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <VitalCard label="Heart Rate" value={vitals.hr} unit="bpm" color="bg-red-50 text-red-700" onChange={(e) => setVitals({...vitals, hr: e.target.value})} />
              <VitalCard label="Blood Pressure" value={vitals.bp} unit="mmHg" color="bg-blue-50 text-blue-700" onChange={(e) => setVitals({...vitals, bp: e.target.value})} />
              <VitalCard label="O2 Saturation" value={vitals.spo2} unit="%" color="bg-green-50 text-green-700" onChange={(e) => setVitals({...vitals, spo2: e.target.value})} />
            </div>

            <button onClick={handlePushVitals} className="w-full bg-theme-accentBlue text-theme-dark font-medium py-4 rounded-xl hover:opacity-90 transition text-lg flex items-center justify-center gap-2">
              <span className="text-xl">📡</span> Push Vitals to Hospital
            </button>
          </div>
        )}

        {/* TAB 3: Hospital Info */}
        {activeTab === 'hospital' && (
          <div className="bg-theme-dark text-white rounded-[2rem] p-6 md:p-10 shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accentBlue rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/3"></div>
             
             <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-white/20">Destination Matched</div>
             <h2 className="text-3xl md:text-4xl font-medium mb-2 relative z-10">City General Hospital</h2>
             <p className="text-white/70 mb-8 relative z-10">Level 1 Trauma Center • Cardiology Available</p>
             
             <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Distance</div>
                  <div className="text-3xl font-light">4.2 <span className="text-lg">mi</span></div>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">ETA</div>
                  <div className="text-3xl font-light">12 <span className="text-lg">mins</span></div>
                </div>
             </div>

             <button className="w-full bg-theme-accentYellow text-theme-dark font-medium py-4 rounded-xl relative z-10 hover:bg-opacity-90 transition">
               Launch Navigation
             </button>
          </div>
        )}

        {/* TAB 4: Emergency Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5">
            <h2 className="text-2xl font-medium mb-8">Case Timeline</h2>
            <div className="flex flex-col gap-6 relative border-l-2 border-theme-dark/10 ml-3 pl-6">
              
              <TimelineEvent time="12:05 PM" title="Emergency Reported" desc="Reporter requested ambulance for Cardiac Arrest." />
              <TimelineEvent time="12:06 PM" title="Unit Dispatched" desc="Unit 42 assigned to location." />
              <TimelineEvent time="12:14 PM" title="Arrived on Scene" desc="EMT initiated patient contact." />
              <TimelineEvent time="12:18 PM" title="PRP Generated" desc="Intake form drafted. Matched to City General Hospital." isActive={true} />
              <TimelineEvent time="Pending" title="Arrival at ER" desc="Awaiting hospital handover." isPending={true} />

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Sub-components for clean code
function TabButton({ name, icon, label, activeTab, setTab }) {
  const isActive = activeTab === name;
  return (
    <button 
      onClick={() => setTab(name)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition whitespace-nowrap md:whitespace-normal ${isActive ? 'bg-theme-accentYellow text-theme-dark' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

function VitalCard({ label, value, unit, color, onChange }) {
  return (
    <div className={`p-5 rounded-2xl border border-black/5 flex flex-col ${color}`}>
      <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">{label}</div>
      <div className="flex items-end gap-1">
        <input type="text" value={value} onChange={onChange} className="bg-transparent text-4xl font-light outline-none w-full max-w-[80px]" />
        <span className="text-sm font-medium opacity-70 pb-1">{unit}</span>
      </div>
    </div>
  );
}

function TimelineEvent({ time, title, desc, isActive, isPending }) {
  return (
    <div className={`relative ${isPending ? 'opacity-40' : ''}`}>
      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-theme-accentYellow' : (isPending ? 'bg-gray-300' : 'bg-theme-dark')}`}></div>
      <div className="text-xs font-bold text-theme-dark/50 mb-1">{time}</div>
      <div className="font-medium text-theme-dark mb-1">{title}</div>
      <div className="text-sm text-theme-dark/70">{desc}</div>
    </div>
  );
}