import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, ClipboardList, Activity, Building2, Clock, Navigation, Heart, Wind, Droplet, CheckCircle } from 'lucide-react';

// Leaflet Map Imports
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

export default function EMTDashboard() {
  const navigate = useNavigate();
  const { id } = useParams(); // If undefined, we are in Standby mode
  const [activeTab, setActiveTab] = useState('intake'); 
  const [syncStatus, setSyncStatus] = useState('Synced');
  const [caseData, setCaseData] = useState(null);

  // Database Data States
  const [patientLocation, setPatientLocation] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Mock Hospitals
  const mockHospitals = [
    { id: 'H-01', name: 'City General Hospital', type: 'Level 1 Trauma Center', lat: 23.0300, lng: 72.5800, distance: '4.2 km', eta: '12 mins' },
    { id: 'H-02', name: 'Mercy Medical Center', type: 'Cardiac Specialty', lat: 23.0150, lng: 72.5600, distance: '2.8 km', eta: '8 mins' },
    { id: 'H-03', name: 'Westside General ER', type: 'Level 2 Trauma Center', lat: 23.0450, lng: 72.5500, distance: '5.1 km', eta: '15 mins' },
    { id: 'H-04', name: 'Apollo Emergency', type: 'Multi-Specialty', lat: 23.0050, lng: 72.5900, distance: '6.5 km', eta: '18 mins' }
  ];

  // Offline Draft for Intake
  const [intakeData, setIntakeData] = useState(() => {
    const saved = localStorage.getItem(`emt_draft_${id}`);
    return saved ? JSON.parse(saved) : {
      patientName: '', age: '', gender: 'Unknown', chiefComplaint: '', medicalHistory: '',
    };
  });

  const [vitals, setVitals] = useState({ hr: '', bp: '', spo2: '', respRate: '' });
  const [vitalsHistory, setVitalsHistory] = useState([]);

  // Auto-Assigner & Data Fetcher
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/emergencies/${id}`)
        .then(res => {
          if (res.data) {
            setCaseData(res.data);
            if (res.data.vitalsLog) setVitalsHistory(res.data.vitalsLog);
            if (res.data.location) setPatientLocation(res.data.location);
            if (res.data.destinationHospital) setSelectedHospital(res.data.destinationHospital);
          }
        })
        .catch(err => console.error("Could not fetch case details:", err));
    } else {
      // Standby Polling Mode
      const checkForAssignments = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/emergencies');
          const activeCase = res.data.find(e => e.status === 'dispatched' || e.status === 'en_route_to_hospital');
          if (activeCase) {
            navigate(`/emt/${activeCase._id}`);
          }
        } catch (err) {
          console.error("Failed to scan for assignments");
        }
      };
      
      checkForAssignments();
      const interval = setInterval(checkForAssignments, 3000);
      return () => clearInterval(interval);
    }
  }, [id, navigate]);

  // Save local draft whenever intake data changes
  useEffect(() => {
    if (id) {
      localStorage.setItem(`emt_draft_${id}`, JSON.stringify(intakeData));
      setSyncStatus('Draft Saved Locally');
      const timer = setTimeout(() => setSyncStatus('Synced'), 2000);
      return () => clearTimeout(timer);
    }
  }, [intakeData, id]);

  const handleIntakeChange = (e) => {
    setIntakeData({ ...intakeData, [e.target.name]: e.target.value });
  };

  const handleGeneratePRP = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSyncStatus('Generating PRP...');
    try {
      // FIX: Removed the extra /prp from the URL to match standard backend update route
      await axios.put(`http://localhost:5000/api/emergencies/${id}`, { prp: intakeData });
      alert('Patient Requirement Profile Generated and Saved!');
      setActiveTab('vitals');
      setSyncStatus('Synced');
    } catch (err) {
      console.error("PRP Submit Error:", err);
      alert(`Error saving PRP: ${err.message}. Is your backend running?`);
      setActiveTab('vitals');
      setSyncStatus('Local Draft');
    }
  };

  const handlePushVitals = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSyncStatus('Pushing Vitals...');
    try {
      const response = await axios.put(`http://localhost:5000/api/emergencies/${id}/vitals`, vitals);
      setVitalsHistory(response.data.vitalsLog || []);
      setVitals({ hr: '', bp: '', spo2: '', respRate: '' });
      setSyncStatus('Vitals Streamed to Hospital');
      setTimeout(() => setSyncStatus('Synced'), 2000);
    } catch (err) {
      console.error("Vitals Error:", err);
      alert(`Error saving Vitals: ${err.message}`);
      setSyncStatus('Offline. Retrying...');
    }
  };

  const handleSelectHospital = async (hospital) => {
    if (!id) return;
    setSyncStatus('Routing & Notifying ER...');
    try {
      // FIX: Removed the extra /prp from the URL
      await axios.put(`http://localhost:5000/api/emergencies/${id}`, { 
        destinationHospital: hospital,
        status: 'en_route_to_hospital' 
      });
      setSelectedHospital(hospital);
      setSyncStatus('ER Notified');
      setTimeout(() => setSyncStatus('Synced'), 2000);
    } catch (err) {
      console.error("Hospital Assign Error:", err);
      alert(`Error notifying hospital: ${err.message}`);
    }
  };

  // --- STANDBY VIEW ---
  if (!id) {
    return (
      <div className="min-h-screen bg-theme-bg font-sans text-theme-dark flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-theme-dark/5 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
            <Activity className="w-8 h-8 text-blue-500 relative z-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">EMT Standby</h2>
          <p className="text-theme-dark/60 font-medium text-sm leading-relaxed">
            Connected to dispatch network. Awaiting an active emergency assignment...
          </p>
        </div>
      </div>
    );
  }

  // --- ACTIVE CASE VIEW ---
  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark flex flex-col md:flex-row">
      <nav className="bg-theme-dark text-white w-full md:w-64 md:min-h-screen p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="text-xl font-bold flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
             <Plus className="w-6 h-6 text-theme-accentYellow stroke-[3]" /> EMT Console
          </div>
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            <TabButton name="intake" icon={<ClipboardList className="w-5 h-5"/>} label="Intake Form" activeTab={activeTab} setTab={setActiveTab} />
            <TabButton name="vitals" icon={<Activity className="w-5 h-5"/>} label="Live Vitals" activeTab={activeTab} setTab={setActiveTab} />
            <TabButton name="hospital" icon={<Building2 className="w-5 h-5"/>} label="Destination" activeTab={activeTab} setTab={setActiveTab} />
            <TabButton name="timeline" icon={<Clock className="w-5 h-5"/>} label="Timeline" activeTab={activeTab} setTab={setActiveTab} />
          </div>
        </div>
        <div className="hidden md:block">
          <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Unit Status</div>
          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-500/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active Assignment
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-theme-dark/5 mb-6">
          <div className="font-bold text-sm tracking-wider uppercase opacity-70">
            Tracking: <span className="text-theme-dark ml-1">{caseData?.emergencyCode || id}</span>
          </div>
          <div className="text-xs font-medium bg-theme-bg px-3 py-1.5 rounded-full text-theme-dark/70 transition-all">
            {syncStatus}
          </div>
        </div>

        {activeTab === 'intake' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5 max-w-3xl mx-auto">
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
              <button type="submit" className="w-full bg-theme-dark text-white font-medium py-3.5 rounded-xl mt-2 hover:bg-opacity-90 transition flex items-center justify-center gap-2">
                <ClipboardList className="w-5 h-5" /> Generate PRP
              </button>
            </form>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-theme-dark/5">
              <h2 className="text-2xl font-medium mb-2 flex items-center gap-2">Live Vitals Stream</h2>
              <p className="text-sm text-theme-dark/60 mb-8">Update current vitals to stream directly to the ER dashboard.</p>
              <form onSubmit={handlePushVitals} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-500"/> Heart Rate</label>
                    <input type="number" placeholder="BPM" value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3.5 text-sm font-mono font-bold outline-none focus:border-theme-dark" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-500"/> BP</label>
                    <input type="text" placeholder="120/80" value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3.5 text-sm font-mono font-bold outline-none focus:border-theme-dark" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-teal-500"/> SpO2</label>
                    <input type="number" placeholder="%" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3.5 text-sm font-mono font-bold outline-none focus:border-theme-dark" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-cyan-500"/> Resp Rate</label>
                    <input type="number" placeholder="BPM" value={vitals.respRate} onChange={e => setVitals({...vitals, respRate: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl p-3.5 text-sm font-mono font-bold outline-none focus:border-theme-dark" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-theme-accentYellow text-theme-dark font-medium py-4 rounded-xl mt-4 hover:bg-opacity-90 transition text-lg flex items-center justify-center gap-2">
                  <Activity className="w-6 h-6 animate-pulse" /> Push Vitals
                </button>
              </form>
            </div>
            <div className="bg-theme-bg rounded-[2rem] p-6 md:p-8 border border-theme-dark/5 h-full flex flex-col min-h-[400px]">
              <h3 className="text-lg font-medium text-theme-dark mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 opacity-60" /> Transmission Log
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {vitalsHistory.length === 0 ? (
                  <div className="text-center text-theme-dark/40 text-sm font-medium mt-10 p-6 rounded-2xl border border-dashed border-theme-dark/10">Awaiting initial vitals scan...</div>
                ) : (
                  [...vitalsHistory].reverse().map((log, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl border border-theme-dark/5 shadow-sm flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-theme-accentBlue uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> {new Date(log.recordedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                      </div>
                      <div className="grid grid-cols-4 gap-2 font-mono text-sm font-bold text-theme-dark text-center bg-theme-bg p-2 rounded-xl border border-theme-dark/5">
                        <div className="flex flex-col"><span className="text-[10px] text-theme-dark/50 uppercase tracking-widest font-sans mb-0.5">HR</span><span className="text-red-500">{log.hr}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-theme-dark/50 uppercase tracking-widest font-sans mb-0.5">BP</span><span className="text-blue-500">{log.bp}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-theme-dark/50 uppercase tracking-widest font-sans mb-0.5">O2</span><span className="text-teal-500">{log.spo2}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] text-theme-dark/50 uppercase tracking-widest font-sans mb-0.5">RR</span><span>{log.respRate || '--'}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hospital' && (
          <div className="max-w-4xl mx-auto">
            {!selectedHospital ? (
              <>
                <h2 className="text-2xl font-medium mb-2">Select Receiving Hospital</h2>
                <p className="text-sm text-theme-dark/60 mb-8">Choose an ER destination to notify them of incoming transport.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockHospitals.map((hospital) => (
                    <div key={hospital.id} className="bg-white p-6 rounded-2xl border border-theme-dark/5 shadow-sm hover:border-theme-accentBlue transition-colors cursor-pointer flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{hospital.name}</h3>
                          <span className="bg-theme-bg text-theme-dark/60 text-[10px] uppercase font-bold px-2 py-1 rounded">{hospital.distance}</span>
                        </div>
                        <p className="text-sm text-theme-dark/60 mb-4">{hospital.type}</p>
                      </div>
                      <button onClick={() => handleSelectHospital(hospital)} className="w-full bg-theme-dark text-white text-sm font-medium py-3 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-auto">
                        Notify & Route <Navigation className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-theme-dark/5 flex flex-col">
                 <div className="p-6 md:p-8 relative bg-slate-50 border-b border-theme-dark/5">
                   <div className="inline-block bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border border-green-200 flex items-center gap-2 w-fit">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Destination Confirmed & ER Notified
                   </div>
                   <h2 className="text-3xl font-bold mb-2 text-theme-dark">{selectedHospital.name}</h2>
                   <p className="text-theme-dark/60 font-medium mb-6">{selectedHospital.type}</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-theme-dark/5 shadow-sm">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-theme-dark/50 mb-1">Distance</div>
                        <div className="text-2xl font-black text-theme-dark">{selectedHospital.distance}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-theme-dark/5 shadow-sm">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-theme-dark/50 mb-1">Live ETA</div>
                        <div className="text-2xl font-black text-theme-dark">{selectedHospital.eta}</div>
                      </div>
                   </div>
                 </div>
                 <div className="h-64 md:h-80 w-full relative bg-slate-200">
                    <MapContainer center={[selectedHospital.lat, selectedHospital.lng]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedHospital.lat, selectedHospital.lng]}><Popup>🏥 {selectedHospital.name}</Popup></Marker>
                      {patientLocation && (
                        <>
                          <Marker position={[patientLocation.lat, patientLocation.lng]}><Popup>🚑 Ambulance</Popup></Marker>
                          <Polyline positions={[[patientLocation.lat, patientLocation.lng], [selectedHospital.lat, selectedHospital.lng]]} color="#3b82f6" weight={5} dashArray="10, 10" />
                        </>
                      )}
                    </MapContainer>
                    <button className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-theme-accentYellow text-theme-dark font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-white transition flex items-center gap-2">
                      <Navigation className="w-5 h-5" /> Open GPS
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-theme-dark/5 max-w-3xl mx-auto">
            <h2 className="text-2xl font-medium mb-8">Case Timeline</h2>
            <div className="flex flex-col gap-6 relative border-l-2 border-theme-dark/10 ml-3 pl-6">
              
              <TimelineEvent 
                time={caseData?.createdAt ? new Date(caseData.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'} 
                title="Emergency Reported" 
                desc="Patient reported emergency to Medilink." 
                isActive={true} 
              />
              
              <TimelineEvent 
                time={caseData?.updatedAt ? new Date(caseData.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'} 
                title="Unit Dispatched" 
                desc={caseData?.assignedAmbulance ? `Unit ${caseData.assignedAmbulance} assigned.` : "Awaiting assignment."} 
                isActive={!!caseData?.assignedAmbulance} 
              />
              
              <TimelineEvent 
                time="Active" 
                title="Arrived on Scene" 
                desc="EMT initiated patient contact & assessment." 
                isActive={true} 
              />
              
              <TimelineEvent 
                time={intakeData.chiefComplaint ? 'Completed' : 'Pending'} 
                title="PRP Generated" 
                desc="Intake form drafted by EMT." 
                isActive={!!intakeData.chiefComplaint} 
                isPending={!intakeData.chiefComplaint}
              />
              
              <TimelineEvent 
                time={selectedHospital ? "Now" : "Pending"} 
                title="Destination Confirmed" 
                desc={selectedHospital ? `Routing to ${selectedHospital.name}. ER notified.` : "Awaiting hospital selection."} 
                isActive={!!selectedHospital} 
                isPending={!selectedHospital} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ name, icon, label, activeTab, setTab }) {
  const isActive = activeTab === name;
  return (
    <button 
      onClick={() => setTab(name)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition whitespace-nowrap md:whitespace-normal ${isActive ? 'bg-theme-accentYellow text-theme-dark' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function TimelineEvent({ time, title, desc, isActive, isPending }) {
  return (
    <div className={`relative ${isPending ? 'opacity-40' : ''}`}>
      <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-theme-accentYellow' : (isPending ? 'bg-gray-300' : 'bg-theme-dark')}`}></div>
      <div className="text-xs font-bold text-theme-dark/50 mb-1">{time}</div>
      <div className="font-medium text-theme-dark mb-1">{title}</div>
      <div className="text-sm text-theme-dark/70">{desc}</div>
    </div>
  );
}