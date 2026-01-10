import React, { useEffect, useState } from 'react';
import { Bot, LogIn, UserPlus, Code, Brain, Zap, ArrowRight, Loader2, LogOut, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from "../service/auth.service";
import { setAuth } from "../store/slices/authSlice";

const LandingPage = () => {
  const isAuth = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await checkAuthStatus();

        if (res) {
          dispatch(setAuth(true));
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [dispatch]);

  /* ---------- LOADING STATE ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">Initializing STAN AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* --- BACKGROUND GLOW EFFECTS --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* --- NAVBAR --- */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              STAN AI
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {!isAuth ? (
              <>
                <Link to="/login" className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/chat" className="hidden md:flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/logout" 
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-300 text-sm font-bold rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            v2.0 is live
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Your Code, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">
              Supercharged by AI
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Stop switching tabs. STAN understands your codebase, context, and coding style. 
            Debug, refactor, and build faster with persistent memory.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              to={isAuth ? "/chat" : "/signup"}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              {isAuth ? "Continue Chatting" : "Start Chatting Free"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </div>

          {/* --- FEATURE CARDS --- */}
          <div id="features" className="grid md:grid-cols-3 gap-6 mt-24 w-full text-left">
            <FeatureCard 
              icon={<Code className="w-6 h-6 text-indigo-400" />}
              title="Code Assistant"
              desc="Debug, refactor, and write complex Python & React code instantly."
            />
            <FeatureCard 
              icon={<Brain className="w-6 h-6 text-pink-400" />}
              title="Persistent Memory"
              desc="STAN remembers previous conversations, so you never have to repeat yourself."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="Real-time Speed"
              desc="Powered by Llama-3 & Groq for ultra-low latency responses."
            />
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm border-t border-white/5">
        <p>© 2026 STAN AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group backdrop-blur-sm cursor-default">
    <div className="w-12 h-12 rounded-xl bg-slate-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner border border-white/5">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;