import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/layout/AdminNavbar';
import { fetchUsers, updateUser } from '../../services/adminService';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [toast, setToast] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      setToast(`User role successfully changed to ${newRole}!`);
      loadUsers();
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await updateUser(userId, { isActive: !currentStatus });
      setToast(`Account status updated!`);
      loadUsers();
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Failed to update account status');
    }
  };

  const filteredUsers = filterRole === 'ALL' 
    ? users 
    : users.filter((u) => u.role === filterRole);

  return (
    <div className="min-h-screen bg-theme-bg font-sans text-theme-dark selection:bg-theme-accentBlue selection:text-theme-dark">
      <AdminNavbar />

      <main className="w-[92%] max-w-[1600px] mx-auto pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-block bg-theme-cardGrey/60 px-3 py-1 rounded-full text-xs font-semibold mb-2 text-theme-dark">
              Access Governance
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-dark">
              User Management & Role-Based Access Control (RBAC)
            </h1>
            <p className="text-theme-dark/70 text-sm mt-1">
              Administer system accounts and assign privileges across EMT, Dispatcher, Hospital Staff, and Admin roles.
            </p>
          </div>
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['ALL', 'Hospital', 'Admin', 'EMT', 'Dispatcher'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterRole === role
                  ? 'bg-theme-dark text-white shadow-sm'
                  : 'bg-white border border-theme-dark/10 text-theme-dark/70 hover:bg-theme-cardGrey/30'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : role}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-theme-dark/10 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-sm font-bold text-theme-dark/50">Loading user directory...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-theme-dark/10 text-theme-dark/50 uppercase tracking-wider font-bold">
                  <th className="pb-4">User Name & Email</th>
                  <th className="pb-4">Assigned Role (RBAC)</th>
                  <th className="pb-4">Associated Hospital</th>
                  <th className="pb-4">Account Status</th>
                  <th className="pb-4">Registered Date</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-dark/5">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-theme-bg/50 transition">
                    <td className="py-4">
                      <div className="font-bold text-theme-dark text-sm">{user.name}</div>
                      <div className="text-theme-dark/50 text-[11px] font-mono">{user.email}</div>
                    </td>

                    <td className="py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-theme-bg border border-theme-dark/15 rounded-xl px-3 py-1.5 text-xs font-bold text-theme-dark outline-none cursor-pointer focus:border-theme-dark"
                      >
                        <option value="Hospital">Hospital Staff</option>
                        <option value="Admin">Administrator</option>
                        <option value="EMT">EMT Paramedic</option>
                        <option value="Dispatcher">Dispatcher</option>
                      </select>
                    </td>

                    <td className="py-4 font-medium text-theme-dark">
                      {user.hospital?.name || (user.role === 'Hospital' ? 'Pending Station Assignment' : '—')}
                    </td>

                    <td className="py-4">
                      <button
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {user.isActive ? '● Active' : '✕ Deactivated'}
                      </button>
                    </td>

                    <td className="py-4 text-theme-dark/50 font-medium text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        className="text-xs font-bold text-theme-dark/60 hover:text-theme-dark underline"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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
