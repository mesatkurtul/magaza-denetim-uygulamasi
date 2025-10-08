import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  if (!userProfile) {
    // Giriş yapılmamışsa login'e yönlendir
    return <Navigate to="/login" />;
  }

  if (userProfile.role === 'Admin') {
    return <Navigate to="/admin" />;
  }

  if (userProfile.role === 'Auditor') {
    return <Navigate to="/dashboard" />;
  }

  // Beklenmedik bir rol veya durum için fallback
  return <Navigate to="/login" />;
};

export default HomePage;