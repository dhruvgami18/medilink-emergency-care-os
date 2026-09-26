import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Context & Protection
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import LiveStatusTracker from './pages/LiveStatusTracker';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/track" element={<LiveStatusTracker />} />
          <Route path="/track/:code" element={<LiveStatusTracker />} />
          
          {/* Authentication Routes (Supports both /auth and /login) */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />

          {/* EMT Protected Route */}
          <Route 
            path="/emt/intake/:id" 
            element={
              <ProtectedRoute allowedRoles={['EMT']}>
                <div className="p-8 text-center text-2xl font-bold">EMT Patient Intake Form (Coming Next)</div>
              </ProtectedRoute>
            } 
          />

          {/* Dispatcher Protected Route */}
          <Route 
            path="/dispatch" 
            element={
              <ProtectedRoute allowedRoles={['Dispatcher', 'Admin']}>
                <div className="p-8 text-center text-2xl font-bold">Dispatcher Dashboard (Coming Later)</div>
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}