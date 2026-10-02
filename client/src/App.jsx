import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Context & Protection
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Teammate Pages (Urvi's Work)
import Home from './pages/Home';
import Auth from './pages/Auth';
import LiveStatusTracker from './pages/LiveStatusTracker';
import EmergencyReportPage from './pages/EmergencyReportPage';
import EMTDashboard from './pages/EMTDashboard';

// Hospital Role Pages (Dhruv's Module)
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import IncomingFeed from './pages/hospital/IncomingFeed';
import ResourceManagement from './pages/hospital/ResourceManagement';
import PatientHistory from './pages/hospital/PatientHistory';

// Admin Role Pages (Dhruv's Module)
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalRegistry from './pages/admin/HospitalRegistry';
import AmbulanceRegistry from './pages/admin/AmbulanceRegistry';
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public & Reporter Routes (Urvi's Work) */}
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<EmergencyReportPage />} />
          <Route path="/track" element={<LiveStatusTracker />} />
          <Route path="/track/:code" element={<LiveStatusTracker />} />
          
          {/* Authentication Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />

          {/* Quick Dashboard Alias */}
          <Route path="/dashboard" element={<Navigate to="/hospital" replace />} />

          {/* Hospital Role Routes (Dhruv) */}
          <Route path="/hospital" element={<HospitalDashboard />} />
          <Route path="/hospital/incoming" element={<IncomingFeed />} />
          <Route path="/hospital/resources" element={<ResourceManagement />} />
          <Route path="/hospital/patients" element={<PatientHistory />} />

          {/* Admin Role Routes (Dhruv) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/registry" element={<HospitalRegistry />} />
          <Route path="/admin/ambulances" element={<AmbulanceRegistry />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/audit" element={<AuditLogs />} />

          {/* EMT & Dispatcher Routes */}
          <Route path="/emt" element={<EMTDashboard />} />
          <Route 
            path="/emt/intake/:id" 
            element={
              <ProtectedRoute allowedRoles={['EMT', 'Admin']}>
                <div className="p-8 text-center text-2xl font-bold bg-theme-bg min-h-screen">
                  EMT Patient Intake Form
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dispatch" 
            element={
              <ProtectedRoute allowedRoles={['Dispatcher', 'Admin']}>
                <div className="p-8 text-center text-2xl font-bold bg-theme-bg min-h-screen">
                  Dispatcher Dashboard
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Fallback for Unauthorized Access */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-theme-bg p-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100 max-w-md">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-theme-dark/60 text-sm">You do not have permission to view this page.</p>
              </div>
            </div>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}