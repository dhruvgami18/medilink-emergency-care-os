import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Context & Protection
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Public Pages (Matching your exact filenames)
import Home from './pages/Home';
import EmergencyReportPage from './pages/EmergencyReportPage';
import LiveStatusTracker from './pages/LiveStatusTracker';
import Auth from './pages/Auth';

// Import Staff Pages (Matching your exact filenames)
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
          
          {/* 1. EMT Route */}
          <Route 
            path="/emt/intake/:id" 
            element={
              <ProtectedRoute allowedRoles={['EMT']}>
                <EMTDashboard />
              </ProtectedRoute>
            } 
          />

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
            <div className="min-h-screen flex items-center justify-center bg-theme-bg p-6">
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