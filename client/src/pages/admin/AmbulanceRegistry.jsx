import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { fetchAmbulances, createAmbulance, fetchHospitals } from '../../services/adminService';

export default function AmbulanceRegistry() {
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: 'ALS',
    hospitalId: '',
    driverName: '',
    driverPhone: '',
    paramedicName: '',
    status: 'available',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ambData, hospData] = await Promise.all([fetchAmbulances(), fetchHospitals()]);
      setAmbulances(ambData);
      setHospitals(hospData);
      if (hospData.length > 0 && !formData.hospitalId) {
        setFormData((prev) => ({ ...prev, hospitalId: hospData[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAmbulance({
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        type: formData.type,
        hospital: formData.hospitalId,
        driverName: formData.driverName,
        driverPhone: formData.driverPhone,
        paramedicName: formData.paramedicName,
        status: formData.status,
        equipment: formData.type === 'ALS' ? ['Ventilator', 'Defibrillator', 'Oxygen'] : ['Oxygen', 'First Aid'],
      });

      setToast(`Ambulance unit ${formData.vehicleNumber} successfully registered into fleet!`);
      setIsModalOpen(false);
      setFormData({
        vehicleNumber: '',
        type: 'ALS',
        hospitalId: hospitals[0]?._id || '',
        driverName: '',
        driverPhone: '',
        paramedicName: '',
        status: 'available',
      });
      loadData();
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to register ambulance');
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
              Fleet Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              Emergency Vehicle & Ambulance Fleet
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Manage Advanced Life Support (ALS) and Basic Life Support (BLS) units assigned across hospitals.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-theme-dark text-white font-bold text-xs px-6 py-3 rounded-full hover:scale-[1.02] shadow-sm transition flex items-center gap-2"
          >
            <span>✚</span> Register Vehicle Unit
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

        {/* Fleet Table */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-sm font-bold text-theme-dark/50">Tracking fleet units...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme-dark/10 text-theme-dark/50 uppercase tracking-wider font-bold">
                  <th className="pb-4">Vehicle Number</th>
                  <th className="pb-4">Unit Capability</th>
                  <th className="pb-4">Base Hospital</th>
                  <th className="pb-4">Assigned Paramedic</th>
                  <th className="pb-4">Driver & Contact</th>
                  <th className="pb-4">Fleet Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-dark/5">
                {ambulances.map((amb) => (
                  <tr key={amb._id} className="hover:bg-theme-bg/50 transition">
                    <td className="py-4 font-bold text-theme-dark">
                      <div className="text-sm font-mono">{amb.vehicleNumber}</div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        amb.type === 'ALS'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {amb.type === 'ALS' ? '★ ALS (Advanced Life Support)' : 'BLS (Basic Support)'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-theme-dark">
                      {amb.hospital?.name || 'Central Dispatch Reserve'}
                    </td>
                    <td className="py-4 text-theme-dark font-medium">
                      {amb.paramedicName || 'On Duty'}
                    </td>
                    <td className="py-4 text-theme-dark/70 font-medium">
                      <div>{amb.driverName}</div>
                      <div className="text-[11px] text-theme-dark/50">{amb.driverPhone}</div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        amb.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : amb.status === 'in_transit'
                          ? 'bg-red-50 text-red-700 animate-pulse'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        ● {amb.status === 'in_transit' ? 'In Transit' : amb.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-dark/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-theme-dark/10">
            <h2 className="text-2xl font-bold text-theme-dark mb-1">Register Fleet Unit</h2>
            <p className="text-xs text-theme-dark/60 mb-6">Add an emergency ambulance vehicle into the registry.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Registration / Plate No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-01-AMB-405"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark uppercase outline-none focus:border-theme-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Vehicle Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  >
                    <option value="ALS">ALS (Advanced Life Support)</option>
                    <option value="BLS">BLS (Basic Life Support)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  >
                    <option value="available">Available (Idle)</option>
                    <option value="in_transit">In Transit</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Base Hospital Station</label>
                <select
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                >
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Lead Paramedic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Sharma"
                    value={formData.paramedicName}
                    onChange={(e) => setFormData({ ...formData, paramedicName: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R. Kumar"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-theme-dark/60 mb-1">Driver Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98110 00000"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full bg-theme-bg border border-theme-dark/20 rounded-xl px-4 py-2.5 text-xs font-bold text-theme-dark outline-none focus:border-theme-dark"
                />
              </div>

              <div className="flex gap-3 pt-3">
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
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
