import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../service/auth.service'; // your backend logout API
import { setAuth } from '../store/slices/authSlice'; // Redux action

const LogoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // 1. Call backend to clear session/cookies
        await logoutUser();

        // 2. Update Redux store
        dispatch(setAuth(false));
      } catch (err) {
        console.error("Logout failed", err);
      } finally {
        // 3. Delay so user sees animation, then redirect
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleLogout();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-10 shadow-2xl relative z-10 text-center">
        
        {/* Icon Animation */}
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full animate-ping" />
          <LogOut className="w-8 h-8 text-indigo-400" />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-white mb-2">Signing Out...</h2>
        <p className="text-slate-400 text-sm mb-8">
          Securely clearing your session and local data.
        </p>

        {/* Loading Spinner / Status */}
        <div className="flex items-center justify-center gap-2 text-indigo-300 bg-indigo-500/10 py-3 px-4 rounded-xl border border-indigo-500/20">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Redirecting to Login</span>
        </div>

      </div>
    </div>
  );
};

export default LogoutPage;
