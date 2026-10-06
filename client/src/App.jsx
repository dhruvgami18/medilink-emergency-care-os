import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Context & Protection
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Public Pages
import Home from './pages/Home';
import EmergencyReportPage from './pages/EmergencyReportPage';
import LiveStatusTracker from './pages/LiveStatusTracker';
import Auth from './pages/Auth';

// Import Staff Pages
import DispatchDashboard from './pages/DispatchDashboard';
import EMTDashboard from './pages/EMTDashboard'; 

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<EmergencyReportPage />} />
          <Route path="/track" element={<LiveStatusTracker />} />
          <Route path="/track/:code" element={<LiveStatusTracker />} />
          
          {/* --- AUTH ROUTES --- */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />

          {/* --- PROTECTED STAFF ROUTES --- */}
          
          {/* 1. EMT Routes */}
          {/* Base EMT Route (After Login) */}
          <Route 
            path="/emt" 
            element={
              <ProtectedRoute allowedRoles={['EMT']}>
                <EMTDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Active Case View (Assigned by Dispatcher) */}
          <Route 
            path="/emt/:id" 
            element={
              <ProtectedRoute allowedRoles={['EMT']}>
                <EMTDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Remove blank dashboard and redirect safely */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          {/* 2. Dispatcher Route */}
          <Route 
            path="/dispatch" 
            element={
              <ProtectedRoute allowedRoles={['Dispatcher', 'Admin']}>
                <DispatchDashboard />
              </ProtectedRoute>
            } 
          />

          {/* --- ERROR/FALLBACK ROUTES --- */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-theme-bg p-6 font-sans">
              <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-red-100 max-w-md">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                <p className="text-theme-dark/60 text-sm">You do not have permission to view this page.</p>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}