export default function PatientInfoFields({ formData, setFormData }) {
  const handleChange = (e) => {
    let value = e.target.value;
    
    // Prevent negative numbers for age
    if (e.target.name === "patientAge") {
      if (value < 0) value = 0;
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold border-b border-theme-dark/10 pb-2">1. Patient & Reporter Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider mb-1 block">Reporter Name</label>
          <input type="text" name="reporterName" required value={formData.reporterName} onChange={handleChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark transition-colors" placeholder="Full Name" />
        </div>
        <div>
          <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider mb-1 block">Phone Number</label>
          <input type="tel" name="reporterPhone" required value={formData.reporterPhone} onChange={handleChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark transition-colors" placeholder="(555) 000-0000" />
        </div>
        <div>
          <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider mb-1 block">Patient Age</label>
          <input 
            type="number" 
            name="patientAge" 
            min="0" /* HTML5 validation */
            value={formData.patientAge} 
            onChange={handleChange} 
            className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark transition-colors" 
            placeholder="Approximate age" 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider mb-1 block">Patient Gender</label>
          <select name="patientGender" value={formData.patientGender} onChange={handleChange} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark transition-colors appearance-none">
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other/Unknown">Other / Unknown</option>
          </select>
        </div>
      </div>
    </div>
  );
}