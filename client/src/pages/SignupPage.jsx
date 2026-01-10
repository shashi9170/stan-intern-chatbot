import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Mail, Lock, Loader2 } from 'lucide-react';
import { registerUser } from "../service/auth.service";
import store from "../store";
import { setAuth } from "../store/slices/authSlice";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // Call API
      await registerUser(username, email, password);

      // Optionally, you can auto-login and set auth true
      // store.dispatch(setAuth(true));

      alert("Account created successfully. Please login.");
      navigate('/login');
    } catch (err) {
      console.error("Signup failed:", err);
      store.dispatch(setAuth(false));
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Join STAN AI and start building smarter.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                name="username"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" 
                placeholder="johndoe123" 
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="email"
                name="email"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" 
                placeholder="you@example.com" 
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="password"
                name="password"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>

        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
