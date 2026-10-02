import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { fetchHospitals, createHospital } from '../../services/adminService';

export default function HospitalRegistry() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    lat: 28.6139,
    lng: 77.2090,
    traumaLevel: 'Level 1',
    contactPhone: '',
    icuTotal: 20,
    generalTotal: 100,
  });

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitals();
      setHospitals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createHospital({
        name: formData.name,
        code: formData.code.toUpperCase(),
        address: formData.address,
        location: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
        traumaLevel: formData.traumaLevel,
        contactPhone: formData.contactPhone,
        resources: {
          icuBeds: { total: parseInt(formData.icuTotal), available: parseInt(formData.icuTotal) - 4 },
          generalBeds: { total: parseInt(formData.generalTotal), available: parseInt(formData.generalTotal) - 20 },
          ventilators: { total: 10, available: 4 },
          oxygenCylinders: { total: 30, available: 15 },
          bloodInventory: [
            { bloodGroup: 'O+', units: 10 },
            { bloodGroup: 'A+', units: 8 },
            { bloodGroup: 'B+', units: 12 },
          ],
        },
      });

      setToast(`Hospital ${formData.name} successfully registered in MediLink network!`);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        address: '',
        lat: 28.6139,
        lng: 77.2090,
        traumaLevel: 'Level 1',
        contactPhone: '',
        icuTotal: 20,
        generalTotal: 100,
      });
      loadHospitals();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to register hospital');
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <AdminNavbar />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
              Network Registry
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              Hospital & Trauma Center Registry
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Onboard and configure healthcare facilities, trauma designation levels, and emergency contacts.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-theme-dark text-white font-bold text-xs px-6 py-3 rounded-full hover:scale-[1.02] shadow-sm transition flex items-center gap-2"
          >
            <span>✚</span> Onboard New Hospital
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl shadow-lg font-bold text-sm mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✓</span> {toast}
            </div>
            <button onClick={() => setToast('')} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Hospitals Table */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-sm font-bold text-theme-dark/50">Loading registered facilities...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme-dark/10 text-theme-dark/50 uppercase tracking-wider font-bold">
                  <th className="pb-4">Facility Name & Code</th>
                  <th className="pb-4">Trauma Level</th>
                  <th className="pb-4">ER Status</th>
                  <th className="pb-4">ICU Beds (Avail/Total)</th>
                  <th className="pb-4">General Beds</th>
                  <th className="pb-4">Contact Phone</th>
                  <th className="pb-4">Coordinates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-dark/5">
                {hospitals.map((hosp) => (
                  <tr key={hosp._id} className="hover:bg-theme-bg/50 transition">
                    <td className="py-4 font-bold text-theme-dark">
                      <div className="text-sm">{hosp.name}</div>
                      <div className="text-[11px] font-mono text-theme-dark/50">{hosp.code}</div>
                    </td>
                    <td className="py-4">
                      <span className="bg-theme-bg text-theme-dark font-bold px-2.5 py-1 rounded-full text-[11px]">
                        {hosp.traumaLevel || 'Level 1'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        hosp.erStatus === 'Normal'
                          ? 'bg-emerald-50 text-emerald-700'
                          : hosp.erStatus === 'Trauma Standby'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        ● {hosp.erStatus || 'Normal'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-theme-dark">
                      {hosp.resources?.icuBeds?.available || 0} / {hosp.resources?.icuBeds?.total || 0}
                    </td>
                    <td className="py-4 font-bold text-theme-dark">
                      {hosp.resources?.generalBeds?.available || 0} / {hosp.resources?.generalBeds?.total || 0}
                    </td>
                    <td className="py-4 text-theme-dark/70 font-medium">
                      {hosp.contactPhone || 'N/A'}
                    </td>
                    <td className="py-4 text-theme-dark/50 font-mono text-[11px]">
                      {hosp.location?.lat?.toFixed(4)}, {hosp.location?.lng?.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>

      {/* Modal for adding hospital */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full shadow-2xl border border-theme-dark/10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-theme-dark mb-1">Onboard Healthcare Facility</h2>
            <p className="text-xs text-theme-dark/60 mb-6">Register a medical center into the MediLink emergency network.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Hospital Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AIIMS Trauma Center"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Unique Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIIMS-TC"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Trauma Designation</label>
                  <select
                    value={formData.traumaLevel}
                    onChange={(e) => setFormData({ ...formData, traumaLevel: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  >
                    <option value="Level 1">Level 1 (Highest)</option>
                    <option value="Level 2">Level 2 (Specialty)</option>
                    <option value="Level 3">Level 3 (Community)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ring Road, Ansari Nagar, New Delhi"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 11 2658 8500"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Total ICU Beds</label>
                  <input
                    type="number"
                    required
                    value={formData.icuTotal}
                    onChange={(e) => setFormData({ ...formData, icuTotal: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-full border border-theme-dark/20 text-xs font-bold text-theme-dark hover:bg-theme-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-theme-dark text-white text-xs font-bold hover:scale-[1.02] shadow-md transition"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
