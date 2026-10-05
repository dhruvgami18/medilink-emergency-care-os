import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMT' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let loggedInUser;
      
      if (isLogin) {
        // 1. Perform login via your context
        loggedInUser = await login(formData.email, formData.password);
        
        // 2. Fallback: If your context doesn't explicitly return the user object, 
        // pull it from localStorage where your AuthContext likely saves it.
        if (!loggedInUser) {
          const userStr = localStorage.getItem('user');
          if (userStr) loggedInUser = JSON.parse(userStr);
        }
      } else {
        // 1. Register the new user
        await axios.post('http://localhost:5000/api/auth/register', formData);
        // 2. Log them in immediately after
        loggedInUser = await login(formData.email, formData.password);
        
        if (!loggedInUser) {
          loggedInUser = { role: formData.role }; // Fallback to what they selected
        }
      }

      // 3. Route dynamically based on the exact user role
      const userRole = loggedInUser?.role || 'EMT'; // Default fallback

      if (userRole === 'Dispatcher' || userRole === 'Admin') {
        navigate('/dispatch');
      } else if (userRole === 'EMT') {
        navigate('/dashboard'); // EMTs wait for an active case assignment
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-theme-dark/5 max-w-md w-full">
        <h1 className="text-3xl font-bold text-theme-dark mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold mb-4 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
              />
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})} 
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              >
                <option value="EMT">EMT / First Responder</option>
                <option value="Dispatcher">Dispatch Coordinator</option>
                <option value="Hospital">Hospital Staff</option>
              </select>
            </>
          )}
          
          <input 
            type="email" 
            placeholder="Email Address" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors" 
          />
          
          <button 
            type="submit" 
            className="w-full bg-theme-dark hover:bg-slate-800 text-white font-bold py-4 rounded-xl mt-2 transition-colors shadow-sm"
          >
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
        
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full text-center text-sm font-bold text-slate-500 mt-6 hover:text-slate-800 transition-colors"
        >
          {isLogin ? "Need an account? Register here" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}