import React, { useState, useEffect } from 'react';
import HospitalNavbar from '../../components/layout/HospitalNavbar';
import { fetchHospitalDashboard, updateHospitalResources } from '../../services/hospitalService';

export default function ResourceManagement() {
  const [hospital, setHospital] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('beds'); // 'beds' | 'blood' | 'equipment'

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitalDashboard('default');
      setHospital(data.hospital);
      setResources(data.hospital.resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleBedChange = (category, field, delta) => {
    setResources((prev) => {
      const current = prev[category][field];
      const nextVal = Math.max(0, current + delta);
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: nextVal,
        },
      };
    });
  };

  const handleBloodChange = (index, delta) => {
    setResources((prev) => {
      const updatedBlood = [...prev.bloodInventory];
      updatedBlood[index].units = Math.max(0, updatedBlood[index].units + delta);
      return {
        ...prev,
        bloodInventory: updatedBlood,
      };
    });
  };

  const handleSave = async () => {
    if (!hospital?._id || !resources) return;
    setSaving(true);
    try {
      await updateHospitalResources(hospital._id, resources);
      setToast('Hospital resources and blood bank successfully synchronized with central dispatch!');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <HospitalNavbar hospitalName={hospital?.name} />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
              Hospital Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              Beds & Blood Bank Inventory
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Maintain live bed availability and blood unit thresholds to guide the dispatch routing algorithm.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-theme-dark text-white font-bold text-xs px-6 py-3 rounded-full hover:scale-[1.02] shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <span>💾</span> {saving ? 'Syncing...' : 'Save & Publish Readiness'}
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

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-theme-cardGrey/50 rounded-2xl max-w-md mb-8">
          <button
            onClick={() => setActiveTab('beds')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'beds'
                ? 'bg-theme-dark text-white shadow-sm'
                : 'text-theme-dark/70 hover:text-theme-dark'
            }`}
          >
            Bed Allocation
          </button>
          <button
            onClick={() => setActiveTab('blood')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'blood'
                ? 'bg-theme-dark text-white shadow-sm'
                : 'text-theme-dark/70 hover:text-theme-dark'
            }`}
          >
            Blood Bank Inventory
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'equipment'
                ? 'bg-theme-dark text-white shadow-sm'
                : 'text-theme-dark/70 hover:text-theme-dark'
            }`}
          >
            Critical Equipment
          </button>
        </div>

        {loading || !resources ? (
          <div className="text-center py-20 font-bold text-theme-dark/50">Loading resource matrix...</div>
        ) : (
          <>
            {/* Tab 1: Beds */}
            {activeTab === 'beds' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* ICU Beds Card */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/50">High-Dependency Unit</span>
                      <h2 className="text-2xl font-bold text-theme-dark mt-1">ICU Resuscitation Beds</h2>
                    </div>
                    <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                      Critical Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Available ICU */}
                    <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 text-center">
                      <div className="text-xs font-bold text-theme-dark/60 mb-1">AVAILABLE NOW</div>
                      <div className="text-4xl font-bold text-theme-dark mb-4">{resources.icuBeds?.available}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('icuBeds', 'available', -1)}
                          className="w-9 h-9 rounded-full bg-white border border-theme-dark/20 text-theme-dark font-bold hover:bg-theme-cardGrey/40 transition"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('icuBeds', 'available', 1)}
                          className="w-9 h-9 rounded-full bg-theme-dark text-white font-bold hover:scale-105 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total ICU */}
                    <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 text-center">
                      <div className="text-xs font-bold text-theme-dark/60 mb-1">TOTAL CAPACITY</div>
                      <div className="text-4xl font-bold text-theme-dark mb-4">{resources.icuBeds?.total}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('icuBeds', 'total', -1)}
                          className="w-9 h-9 rounded-full bg-white border border-theme-dark/20 text-theme-dark font-bold hover:bg-theme-cardGrey/40 transition"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('icuBeds', 'total', 1)}
                          className="w-9 h-9 rounded-full bg-theme-dark text-white font-bold hover:scale-105 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-theme-dark/70 bg-amber-50/60 border border-amber-200/60 p-3.5 rounded-xl">
                    💡 <strong>Viva Logic:</strong> When you accept an emergency with a Red triage score, this available ICU counter automatically decrements by 1.
                  </div>
                </div>

                {/* General Beds Card */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-theme-dark/50">General Ward</span>
                      <h2 className="text-2xl font-bold text-theme-dark mt-1">General Trauma Beds</h2>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                      Standard Tier
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Available General */}
                    <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 text-center">
                      <div className="text-xs font-bold text-theme-dark/60 mb-1">AVAILABLE NOW</div>
                      <div className="text-4xl font-bold text-theme-dark mb-4">{resources.generalBeds?.available}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('generalBeds', 'available', -1)}
                          className="w-9 h-9 rounded-full bg-white border border-theme-dark/20 text-theme-dark font-bold hover:bg-theme-cardGrey/40 transition"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('generalBeds', 'available', 1)}
                          className="w-9 h-9 rounded-full bg-theme-dark text-white font-bold hover:scale-105 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Total General */}
                    <div className="bg-theme-bg p-5 rounded-2xl border border-theme-dark/5 text-center">
                      <div className="text-xs font-bold text-theme-dark/60 mb-1">TOTAL CAPACITY</div>
                      <div className="text-4xl font-bold text-theme-dark mb-4">{resources.generalBeds?.total}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('generalBeds', 'total', -1)}
                          className="w-9 h-9 rounded-full bg-white border border-theme-dark/20 text-theme-dark font-bold hover:bg-theme-cardGrey/40 transition"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('generalBeds', 'total', 1)}
                          className="w-9 h-9 rounded-full bg-theme-dark text-white font-bold hover:scale-105 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-theme-dark/70 bg-emerald-50/60 border border-emerald-200/60 p-3.5 rounded-xl">
                    ✓ <strong>Capacity Check:</strong> Yellow and Green triage admissions are routed to General Ward beds.
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Blood Bank */}
            {activeTab === 'blood' && (
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-theme-dark">Blood Bank Inventory</h2>
                    <p className="text-xs text-theme-dark/60 mt-0.5">Threshold alert triggers when units fall to 5 or fewer.</p>
                  </div>
                  <span className="text-xs font-semibold text-theme-dark/50">8 Groups Configured</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {resources.bloodInventory?.map((item, idx) => {
                    const isLow = item.units <= 5;
                    return (
                      <div
                        key={item.bloodGroup}
                        className={`p-5 rounded-2xl border transition-all ${
                          isLow
                            ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                            : 'bg-theme-bg/60 border-theme-dark/10'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xl font-black text-theme-dark">{item.bloodGroup}</span>
                          {isLow && (
                            <span className="text-[10px] font-bold uppercase bg-amber-600 text-white px-2 py-0.5 rounded-md">
                              Low Stock
                            </span>
                          )}
                        </div>

                        <div className="text-3xl font-bold text-theme-dark mb-4">
                          {item.units} <span className="text-xs font-normal text-theme-dark/60">Units</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-theme-dark/10">
                          <span className="text-xs font-medium text-theme-dark/50">Adjust:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBloodChange(idx, -1)}
                              className="w-8 h-8 rounded-full bg-white border border-theme-dark/20 text-xs font-bold hover:bg-theme-cardGrey/40 transition"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleBloodChange(idx, 1)}
                              className="w-8 h-8 rounded-full bg-theme-dark text-white text-xs font-bold hover:scale-105 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Critical Equipment */}
            {activeTab === 'equipment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Ventilators */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm">
                  <h3 className="text-xl font-bold text-theme-dark mb-1">Mechanical Ventilators</h3>
                  <p className="text-xs text-theme-dark/60 mb-6">Invasive & non-invasive mechanical support units.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-theme-bg p-4 rounded-2xl text-center">
                      <div className="text-xs font-bold text-theme-dark/50 mb-1">AVAILABLE</div>
                      <div className="text-3xl font-bold text-theme-dark mb-3">{resources.ventilators?.available}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('ventilators', 'available', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-theme-dark/20 text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('ventilators', 'available', 1)}
                          className="w-8 h-8 rounded-full bg-theme-dark text-white text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-theme-bg p-4 rounded-2xl text-center">
                      <div className="text-xs font-bold text-theme-dark/50 mb-1">TOTAL</div>
                      <div className="text-3xl font-bold text-theme-dark mb-3">{resources.ventilators?.total}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('ventilators', 'total', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-theme-dark/20 text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('ventilators', 'total', 1)}
                          className="w-8 h-8 rounded-full bg-theme-dark text-white text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oxygen Cylinders */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm">
                  <h3 className="text-xl font-bold text-theme-dark mb-1">Medical Oxygen Cylinders</h3>
                  <p className="text-xs text-theme-dark/60 mb-6">High-flow pressurized oxygen canisters on standby.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-theme-bg p-4 rounded-2xl text-center">
                      <div className="text-xs font-bold text-theme-dark/50 mb-1">AVAILABLE</div>
                      <div className="text-3xl font-bold text-theme-dark mb-3">{resources.oxygenCylinders?.available}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('oxygenCylinders', 'available', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-theme-dark/20 text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('oxygenCylinders', 'available', 1)}
                          className="w-8 h-8 rounded-full bg-theme-dark text-white text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-theme-bg p-4 rounded-2xl text-center">
                      <div className="text-xs font-bold text-theme-dark/50 mb-1">TOTAL</div>
                      <div className="text-3xl font-bold text-theme-dark mb-3">{resources.oxygenCylinders?.total}</div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleBedChange('oxygenCylinders', 'total', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-theme-dark/20 text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleBedChange('oxygenCylinders', 'total', 1)}
                          className="w-8 h-8 rounded-full bg-theme-dark text-white text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
