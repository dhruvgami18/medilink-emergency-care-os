import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { fetchAuditLogs } from '../../services/adminService';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch =
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEntity?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const uniqueActions = ['ALL', ...new Set(logs.map((l) => l.action))];

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <AdminNavbar />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
              Compliance & Security
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              Security Audit Logs & Traceability
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Immutable, chronological record of critical actions: bed reservations, resource changes, and access modifications.
            </p>
          </div>

          <button
            onClick={loadLogs}
            className="bg-white border border-theme-dark/15 text-theme-dark font-bold text-xs px-5 py-2.5 rounded-full hover:bg-theme-cardGrey/30 transition flex items-center gap-2"
          >
            <span>↻</span> Refresh Audit Trail
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-theme-dark/10 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <input
            type="text"
            placeholder="Search audit details, actor, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-theme-bg border border-theme-dark/15 rounded-full py-2.5 px-5 text-xs font-medium text-theme-dark placeholder:text-theme-dark/40 outline-none focus:border-theme-dark"
          />

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs font-bold text-theme-dark/50 shrink-0">Filter Event:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-theme-bg border border-theme-dark/15 rounded-xl px-3 py-2 text-xs font-bold text-theme-dark outline-none cursor-pointer"
            >
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-sm font-bold text-theme-dark/50">Fetching cryptographic audit logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-theme-dark/50">No audit logs matching query.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme-dark/10 text-theme-dark/50 uppercase tracking-wider font-bold">
                  <th className="pb-4">Timestamp</th>
                  <th className="pb-4">Action Type</th>
                  <th className="pb-4">Actor & Role</th>
                  <th className="pb-4">Target Entity</th>
                  <th className="pb-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-dark/5">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-theme-bg/50 transition">
                    <td className="py-4 text-theme-dark/60 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt || log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-4">
                      <span className="bg-theme-bg border border-theme-dark/10 text-theme-dark font-mono font-bold px-2.5 py-1 rounded-md text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="font-bold text-theme-dark">{log.performedBy?.name || 'System'}</div>
                      <div className="text-[10px] text-theme-dark/50 font-bold uppercase">{log.performedBy?.role || 'Admin'}</div>
                    </td>

                    <td className="py-4 font-bold text-theme-dark/80">
                      {log.targetEntity}
                    </td>

                    <td className="py-4 text-theme-dark/80 max-w-md font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  );
}
