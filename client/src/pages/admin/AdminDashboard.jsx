import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { fetchAdminStats } from '../../services/adminService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const kpis = stats?.kpis;
  const bedCap = stats?.bedCapacity;
  const logs = stats?.recentAuditLogs || [];

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <AdminNavbar />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Banner Section */}
        <section className="bg-theme-dark rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-white/20">
                <span className="text-theme-accentYellow">★</span> Central Coordination Hub
              </div>
              <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-2">
                System-Wide Intelligence & Governance
              </h1>
              <p className="text-white/80 text-sm md:text-base font-light">
                Monitoring network-wide hospital bed capacities, active emergency fleets, and compliance audit logs.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/hospital')}
                className="bg-theme-accentYellow text-theme-dark px-6 py-3 rounded-full text-xs font-bold hover:scale-[1.02] shadow-sm transition"
              >
                Go to Hospital ER Desk ➔
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-20 font-bold text-theme-dark/40">Aggregating system telemetry...</div>
        ) : (
          <>
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              
              <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-theme-dark/60 mb-2">Network Hospitals</div>
                <div className="text-4xl font-bold text-theme-dark">{kpis?.totalHospitals || 0}</div>
                <div className="text-xs text-theme-dark/60 mt-3">Trauma Centers Connected</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-theme-dark/60 mb-2">Ambulance Fleet</div>
                <div className="text-4xl font-bold text-theme-dark flex items-baseline gap-2">
                  <span>{kpis?.totalAmbulances || 0}</span>
                  <span className="text-xs text-emerald-700 font-bold">({kpis?.availableAmbulances || 0} Idle)</span>
                </div>
                <div className="text-xs text-theme-dark/60 mt-3">{kpis?.activeAmbulances || 0} Units in Transit</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-theme-dark/60 mb-2">Total Emergencies</div>
                <div className="text-4xl font-bold text-theme-dark">{kpis?.totalEmergencies || 0}</div>
                <div className="text-xs text-theme-dark/60 mt-3">{kpis?.activeEmergencies || 0} Currently Active</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-theme-dark/60 mb-2">Avg. Response Time</div>
                <div className="text-4xl font-bold text-theme-dark">{kpis?.avgResponseTimeMinutes || 7.4} <span className="text-sm font-normal">min</span></div>
                <div className="text-xs text-emerald-700 font-bold mt-3">Success Rate: {kpis?.admissionSuccessRate || '98.2%'}</div>
              </div>

            </div>

            {/* Middle Section: Bed Capacity Breakdown + Fast Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              
              {/* Bed Capacity Summary */}
              <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-theme-dark">Network Bed Capacity</h2>
                    <p className="text-xs text-theme-dark/60 mt-0.5">Aggregated in real-time across all registered hospitals.</p>
                  </div>
                  <span className="text-xs font-bold bg-theme-bg px-3 py-1 rounded-full text-theme-dark">
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-6">
                  {/* ICU Beds Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-theme-dark">ICU Resuscitation Beds</span>
                      <span className="text-theme-dark/70">
                        {bedCap?.availIcu || 0} Available / {bedCap?.totalIcu || 0} Total ({bedCap?.occupiedIcu || 0} Occupied)
                      </span>
                    </div>
                    <div className="w-full bg-theme-cardGrey rounded-full h-3 overflow-hidden flex">
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${bedCap?.totalIcu ? ((bedCap.occupiedIcu / bedCap.totalIcu) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* General Beds Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-theme-dark">General Ward Beds</span>
                      <span className="text-theme-dark/70">
                        {bedCap?.availGen || 0} Available / {bedCap?.totalGen || 0} Total ({bedCap?.occupiedGen || 0} Occupied)
                      </span>
                    </div>
                    <div className="w-full bg-theme-cardGrey rounded-full h-3 overflow-hidden flex">
                      <div 
                        className="bg-emerald-600 h-full" 
                        style={{ width: `${bedCap?.totalGen ? ((bedCap.occupiedGen / bedCap.totalGen) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Registry Navigation Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-theme-dark/10">
                  <button
                    onClick={() => navigate('/admin/registry')}
                    className="p-3.5 rounded-2xl bg-theme-bg hover:bg-theme-cardGrey/40 text-left transition"
                  >
                    <div className="font-bold text-xs text-theme-dark">🏥 Hospital Registry</div>
                    <div className="text-[11px] text-theme-dark/60 mt-0.5">Manage trauma centers</div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/ambulances')}
                    className="p-3.5 rounded-2xl bg-theme-bg hover:bg-theme-cardGrey/40 text-left transition"
                  >
                    <div className="font-bold text-xs text-theme-dark">🚑 Ambulance Fleet</div>
                    <div className="text-[11px] text-theme-dark/60 mt-0.5">Register ALS / BLS units</div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/users')}
                    className="p-3.5 rounded-2xl bg-theme-bg hover:bg-theme-cardGrey/40 text-left transition"
                  >
                    <div className="font-bold text-xs text-theme-dark">👥 User Management</div>
                    <div className="text-[11px] text-theme-dark/60 mt-0.5">RBAC & role assignments</div>
                  </button>
                </div>
              </div>

              {/* Recent Audit Activity */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-theme-dark">Security Audit Feed</h3>
                    <button
                      onClick={() => navigate('/admin/audit')}
                      className="text-xs font-bold text-theme-dark/60 hover:text-theme-dark"
                    >
                      All Logs ➔
                    </button>
                  </div>

                  <div className="space-y-3">
                    {logs.slice(0, 5).map((log) => (
                      <div key={log._id} className="text-xs p-3 rounded-xl bg-theme-bg/60 border border-theme-dark/5">
                        <div className="flex justify-between font-bold text-theme-dark">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-theme-dark/50">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-theme-dark/70 text-[11px] mt-1 line-clamp-1">{log.details}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/admin/audit')}
                    className="w-full py-2.5 rounded-full border border-theme-dark/15 text-xs font-bold text-theme-dark hover:bg-theme-bg transition"
                  >
                    View Comprehensive Audit Trail
                  </button>
                </div>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
