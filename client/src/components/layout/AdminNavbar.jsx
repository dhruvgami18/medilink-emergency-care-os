import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-theme-dark/95 backdrop-blur-md shadow-lg border-b border-white/10 py-3.5">
      <div className="w-[92%] max-w-[1600px] mx-auto flex flex-wrap justify-between items-center gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-2xl font-bold flex items-center gap-2 text-white hover:opacity-90 transition"
          >
            <span className="text-xl text-theme-accentYellow">✚</span> MediLink
          </button>
          <div className="hidden lg:block h-6 w-px bg-white/20"></div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs text-white/50 uppercase tracking-widest font-semibold">Central Admin Console</span>
            <span className="text-sm font-bold text-theme-accentYellow tracking-tight">System Administrator</span>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div className="hidden md:flex items-center gap-1 bg-white/10 p-1.5 rounded-full border border-white/10 text-xs font-semibold">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`
            }
          >
            System KPIs
          </NavLink>

          <NavLink
            to="/admin/registry"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`
            }
          >
            Hospitals
          </NavLink>

          <NavLink
            to="/admin/ambulances"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`
            }
          >
            Ambulances
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`
            }
          >
            Users & RBAC
          </NavLink>

          <NavLink
            to="/admin/audit"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-theme-accentYellow text-theme-dark font-bold shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`
            }
          >
            Audit Logs
          </NavLink>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hospital')}
            className="bg-theme-accentBlue text-theme-dark px-3.5 py-1.5 rounded-full text-xs font-bold hover:scale-[1.02] transition shadow-sm"
            title="Switch to Hospital ER role"
          >
            Switch to Hospital ER ➔
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-medium transition"
          >
            Public Home
          </button>
        </div>

      </div>
    </nav>
  );
}
