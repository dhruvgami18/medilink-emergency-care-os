import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import { useDraftStorage } from "../hooks/useDraftStorage";
import { submitEmergencyReport } from "../services/emergencyService";
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
    if (formData.symptoms.length === 0) return alert("Please select at least one symptom.");
    
    setSubmitState("submitting");
    try {
      // Map flat form data to the nested backend schema
      const payload = {
        reporterName: formData.reporterName,
        reporterPhone: formData.reporterPhone,
        patient: {
          age: parseInt(formData.patientAge) || null,
          gender: formData.patientGender,
          symptoms: formData.symptoms,
          notes: formData.notes,
        },
        location: geo.coords || { lat: 0, lng: 0 }, // Fallback if geo fails but manual addr is used
      };

      const result = await submitEmergencyReport(payload);
      setTrackingCode(result.trackingCode);
      setSubmitState("success");
      clearDraft();
    } catch (err) {
      setSubmitState("error");
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg pb-12">
      
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