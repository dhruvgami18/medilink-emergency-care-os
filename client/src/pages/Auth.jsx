import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Temporary function to simulate login routing based on role
  const handleSubmit = (e) => {
    e.preventDefault();
    const role = e.target.role?.value || 'dispatcher'; // Defaulting for demo
    
    if (role === 'emt') navigate('/emt');
    else if (role === 'dispatcher') navigate('/dispatch');
  };

  return (
    <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4">
      
      {/* Back to Home Navigation */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-theme-dark font-medium flex items-center gap-2 hover:opacity-70 transition"
      >
        ← Back to Home
      </button>

      <div className="bg-theme-dark w-full max-w-md rounded-[2rem] p-10 text-white shadow-xl">
        <div className="text-2xl font-bold flex items-center gap-2 mb-8 justify-center">
           <span className="text-xl text-theme-accentYellow">✚</span> MediLink
        </div>

        <h2 className="text-3xl font-medium mb-2 text-center">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-white/60 text-sm text-center mb-8">
          {isLogin ? 'Enter your credentials to access your dashboard.' : 'Register as an emergency responder or dispatcher.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {!isLogin && (
            <div>
              <label className="text-xs font-medium text-white/70 mb-1 block">Full Name</label>
              <input type="text" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-accentYellow transition" placeholder="John Doe" />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-white/70 mb-1 block">Email Address</label>
            <input type="email" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-accentYellow transition" placeholder="name@hospital.com" />
          </div>

          <div>
            <label className="text-xs font-medium text-white/70 mb-1 block">Password</label>
            <input type="password" required className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-accentYellow transition" placeholder="••••••••" />
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-medium text-white/70 mb-1 block">System Role</label>
              <select name="role" className="w-full bg-theme-dark border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-theme-accentYellow transition text-white">
                <option value="dispatcher">Dispatch Coordinator</option>
                <option value="emt">EMT / Ambulance Staff</option>
                <option value="hospital">Hospital Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full bg-theme-accentYellow text-theme-dark font-medium py-3.5 rounded-xl mt-4 hover:bg-opacity-90 transition">
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/60">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-theme-accentYellow font-medium hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}