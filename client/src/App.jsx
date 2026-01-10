import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import LogoutPage from "./pages/Logout";

function App() {
  const isAuth = useSelector(state => state.auth.isAuthenticated); // get auth state

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!isAuth ? <SignupPage /> : <Navigate to="/" replace />} />

        {/* Protected Routes */}
        <Route path="/chat" element={isAuth ? <ChatPage /> : <Navigate to="/" replace />} />
        <Route path="/logout" element={isAuth ? <LogoutPage /> : <Navigate to="/" replace />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
