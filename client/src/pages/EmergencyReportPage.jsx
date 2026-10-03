import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Added missing import
import { useGeolocation } from "../hooks/useGeolocation";
import { useDraftStorage } from "../hooks/useDraftStorage";
import PatientInfoFields from "../components/report/PatientInfoFields";
import SymptomChecklist from "../components/report/SymptomChecklist";
import LocationCapture from "../components/report/LocationCapture";
import SubmitStatusPanel from "../components/report/SubmitStatusPanel";

const initialForm = {
  reporterName: "",
  reporterPhone: "",
  patientAge: "",
  patientGender: "",
  symptoms: [],
  notes: "",
};

export default function EmergencyReportPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [submitState, setSubmitState] = useState("idle"); 
  const [trackingCode, setTrackingCode] = useState(null);

  const geo = useGeolocation();
  const { clearDraft } = useDraftStorage(formData, setFormData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("submitting"); // Updates your button UI

    try {
      // 1. Prepare payload with form data AND live GPS coordinates
      const payload = {
        ...formData,
        location: geo.coords 
          ? { lat: geo.coords.latitude, lng: geo.coords.longitude } 
          : { lat: 23.0225, lng: 72.5714 } // Fallback to default if GPS fails
      };

      // 2. Send the data to the backend
      const response = await axios.post('http://localhost:5000/api/emergencies', payload);
      
      // 3. Extract the code specifically (matching our backend)
      const newCode = response.data.emergencyCode; 
      
      // 4. Update UI states and clear draft
      setTrackingCode(newCode);
      setSubmitState("success");
      clearDraft();

      // 5. Redirect to the tracker
      navigate(`/track/${newCode}`); 
      
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitState("error");
      alert("Failed to submit emergency. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg pb-12 font-sans">
      
      {/* Header Bar */}
      <div className="bg-theme-dark text-white py-12 px-6 md:px-16 rounded-b-[2.5rem] mb-8">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mb-6">
            ← Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Report an Emergency</h1>
          <p className="text-white/70 mt-3 max-w-lg">
            Every second counts. Fill in what you can — you can update details later. Auto-saving is active.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-[2rem] shadow-sm border border-theme-dark/5 p-6 md:p-10 space-y-10">
          <PatientInfoFields formData={formData} setFormData={setFormData} />
          <SymptomChecklist formData={formData} setFormData={setFormData} />
          <LocationCapture geo={geo} />

          <motion.button
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={submitState === "submitting" || submitState === "success"}
            className="w-full bg-theme-accentYellow text-theme-dark font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-60 text-lg"
          >
            {submitState === "submitting" ? "Transmitting Profile..." : "Submit Emergency Report"}
          </motion.button>
        </form>

        {/* Status Panel */}
        <div className="lg:col-span-2">
          <SubmitStatusPanel state={submitState} trackingCode={trackingCode} coords={geo.coords} />
        </div>

      </div>
    </div>
  );
}