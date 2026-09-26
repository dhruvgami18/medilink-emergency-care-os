import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import EmergencyReportPage from './pages/EmergencyReportPage';
import EMTDashboard from './pages/EMTDashboard';
import DispatchDashboard from './pages/DispatchDashboard';
import LiveStatusTracker from './pages/LiveStatusTracker';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/report" element={<EmergencyReportPage />} />
        <Route path="/track" element={<LiveStatusTracker />} />
        <Route path="/track/:code" element={<LiveStatusTracker />} />
        
        {/* Protected / Role-Based Routes */}
        <Route path="/emt/*" element={<EMTDashboard />} />
        <Route path="/dispatch/*" element={<DispatchDashboard />} />
      </Routes>
    </Router>
  );
}