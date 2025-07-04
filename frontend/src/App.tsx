import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserPage from './components/UserPage';
import './App.css';

const AdminLoginPage = () => {
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (authToken: string) => {
    setToken(authToken);
    // Store token in localStorage for persistence
    localStorage.setItem('adminToken', authToken);
  };

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLogin onLogin={handleLogin} />;
};

const AdminDashboardPage = () => {
  // Check for existing token in localStorage
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('adminToken')
  );

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminDashboard token={token} onLogout={handleLogout} />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
