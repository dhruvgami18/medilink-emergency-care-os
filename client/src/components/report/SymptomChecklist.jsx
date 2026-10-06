export default function SymptomChecklist({ formData, setFormData }) {
  const commonSymptoms = ["Chest Pain", "Breathing Difficulty", "Unconscious", "Severe Bleeding", "Stroke Symptoms", "Trauma / Fall"];

  const toggleSymptom = (symptom) => {
    const updated = formData.symptoms.includes(symptom)
      ? formData.symptoms.filter(s => s !== symptom)
      : [...formData.symptoms, symptom];
    setFormData({ ...formData, symptoms: updated });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold border-b border-theme-dark/10 pb-2">2. Clinical Assessment</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {commonSymptoms.map(symptom => (
          <label key={symptom} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors text-sm font-medium ${formData.symptoms.includes(symptom) ? 'bg-theme-dark text-white border-theme-dark' : 'bg-theme-bg border-theme-dark/10 hover:border-theme-dark/30'}`}>
            <input type="checkbox" checked={formData.symptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} className="hidden" />
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.symptoms.includes(symptom) ? 'border-white bg-theme-accentYellow' : 'border-theme-dark/30 bg-white'}`}>
              {formData.symptoms.includes(symptom) && <span className="text-theme-dark text-xs font-bold">✓</span>}
            </div>
            {symptom}
          </label>
        ))}
      </div>
      <div>
        <label className="text-xs font-bold text-theme-dark/70 uppercase tracking-wider mb-1 block mt-4">Additional Notes</label>
        <textarea name="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="2" className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-dark transition-colors resize-none" placeholder="Describe the situation..."></textarea>
      </div>
    </div>
  );
}