import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Reporter() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' or 'tracking'
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle', 'locating', 'success', 'error'
  const [formData, setFormData] = useState({
    callerName: '',
    phone: '',
    incidentType: 'Cardiac Arrest',
    description: '',
    latitude: null,
    longitude: null,
  });

  // HTML5 Geolocation API Integration
  const handleGetLocation = () => {
    setLocationStatus('locating');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error obtaining location:", error);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In the real app, this will POST to /api/emergencies
    console.log("Emergency Reported:", formData);
    setStep('tracking');
  };

  return (
    <div className="min-h-screen bg-theme-bg p-4 md:p-8 font-sans text-theme-dark flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="font-medium hover:opacity-70 transition flex items-center gap-2">
          ← Back
        </button>
        <div className="text-xl font-bold flex items-center gap-2">
           <span className="text-theme-accentYellow">✚</span> MediLink Reporter
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-theme-dark/5">
        
        {step === 'form' ? (
          <>
            <div className="mb-10">
              <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                Emergency Intake
              </div>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2">Report an Incident</h1>
              <p className="text-theme-dark/60 text-sm">Please provide accurate details so we can dispatch the right resources immediately.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Your Name</label>
                  <input type="text" name="callerName" required onChange={handleInputChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-theme-dark transition" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Phone Number</label>
                  <input type="tel" name="phone" required onChange={handleInputChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-theme-dark transition" placeholder="(555) 000-0000" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Incident Type</label>
                <select name="incidentType" onChange={handleInputChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-theme-dark transition appearance-none">
                  <option>Cardiac Arrest</option>
                  <option>Trauma / Accident</option>
                  <option>Stroke / Neurological</option>
                  <option>Respiratory Distress</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-theme-dark/70 mb-1.5 block uppercase tracking-wider">Brief Description</label>
                <textarea name="description" required onChange={handleInputChange} rows="3" className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-theme-dark transition resize-none" placeholder="Describe the patient's condition..."></textarea>
              </div>

              {/* Location Capture */}
              <div className="bg-theme-cardGrey/30 p-5 rounded-2xl border border-theme-dark/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm mb-1">Incident Location</div>
                  <div className="text-xs text-theme-dark/60">
                    {locationStatus === 'success' ? `Coordinates: ${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}` : 'We need your exact location for the ambulance.'}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${locationStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-theme-dark text-white hover:bg-opacity-90'}`}
                >
                  {locationStatus === 'idle' && 'Share Location'}
                  {locationStatus === 'locating' && 'Locating...'}
                  {locationStatus === 'success' && '✓ Captured'}
                  {locationStatus === 'error' && 'Retry Location'}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={locationStatus !== 'success'}
                className="w-full bg-red-600 disabled:bg-red-300 text-white font-medium py-4 rounded-xl mt-4 hover:bg-red-700 transition shadow-sm text-lg"
              >
                Dispatch Ambulance
              </button>
            </form>
          </>
        ) : (
          
          /* Live Status Tracker View */
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
              ✓
            </div>
            <h2 className="text-3xl font-medium tracking-tight mb-2">Ambulance Dispatched</h2>
            <p className="text-theme-dark/60 text-sm mb-10 max-w-sm">Help is on the way. A unit has been assigned to your location and the receiving hospital has been notified.</p>
            
            <div className="w-full bg-theme-bg p-8 rounded-3xl border border-theme-dark/10 relative overflow-hidden text-left">
              <div className="flex justify-between items-center mb-6">
                <div className="font-bold text-sm tracking-widest uppercase opacity-70">Live Status</div>
                <div className="animate-pulse flex items-center gap-2 text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span> Live
                </div>
              </div>
              
              <div className="text-5xl font-light mb-2">4 <span className="text-2xl text-theme-dark/50 font-medium">mins away</span></div>
              <div className="text-sm font-medium">Unit: <span className="opacity-70">Medic-42 (Advanced Life Support)</span></div>
              
              <div className="w-full bg-theme-cardGrey h-2 rounded-full mt-8 overflow-hidden">
                <div className="bg-green-500 h-full w-[60%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs font-bold text-theme-dark/50 uppercase tracking-wider mt-3">
                <span>Dispatched</span>
                <span>Arriving</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}