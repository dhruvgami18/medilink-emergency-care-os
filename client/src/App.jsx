import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Reporter from './pages/Reporter';
import EMTDashboard from './pages/EMTDashboard';
import DispatchDashboard from './pages/DispatchDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/report" element={<Reporter />} />
        
        {/* Protected / Role-Based Routes */}
        <Route path="/emt/*" element={<EMTDashboard />} />
        <Route path="/dispatch/*" element={<DispatchDashboard />} />
      </Routes>
    </Router>
  );
}