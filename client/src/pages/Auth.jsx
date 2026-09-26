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
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard'); // Route dynamically later based on role
      } else {
        await axios.post('http://localhost:5000/api/auth/register', formData);
        await login(formData.email, formData.password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-6">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-theme-dark/5 max-w-md w-full">
        <h1 className="text-3xl font-medium text-theme-dark mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h1>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none" />
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none">
                <option value="EMT">EMT / First Responder</option>
                <option value="Dispatcher">Dispatch Coordinator</option>
                <option value="Hospital">Hospital Staff</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none" />
          <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-theme-bg border border-theme-dark/10 rounded-xl px-4 py-3 text-sm outline-none" />
          
          <button type="submit" className="w-full bg-theme-dark text-white font-bold py-4 rounded-xl mt-2">
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>
        
        <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-sm font-bold text-theme-dark/60 mt-6 hover:text-theme-dark">
          {isLogin ? "Need an account? Register here" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}