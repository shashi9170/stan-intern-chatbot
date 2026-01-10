import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser } from "../service/auth.service";
import store from "../store";
import { setAuth } from "../store/slices/authSlice";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get input values from form
    const formData = new FormData(e.target);
    const email = formData.get("username");
    const password = formData.get("password");

    try {
      // Call API
      const res = await loginUser(email, password);

      // ✅ Set Redux auth state to true
      store.dispatch(setAuth(true));

      // Navigate to chat page
      navigate('/');
    } catch (err) {
      // ✅ Set Redux auth state to false
      store.dispatch(setAuth(false));

      alert("Login failed. Please check your credentials or signup.");
      navigate('/signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/20 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm">Sign in to continue your conversation</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Username</label>
            <div className="relative group">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              name="username"
              required
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              placeholder="Enter your username"
            />
          </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">Password</label>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="password"
                name="password"
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
