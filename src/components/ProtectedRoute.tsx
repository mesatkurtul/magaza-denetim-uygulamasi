import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  requiredRole: 'Admin' | 'Auditor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Yetki kontrol ediliyor...
      </div>
    );
  }

  if (!userProfile) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir.
    return <Navigate to="/login" />;
  }

  if (userProfile.role !== requiredRole) {
    // Kullanıcının rolü istenen rolle eşleşmiyorsa ana sayfaya yönlendir.
    // Alternatif olarak bir "Yetkisiz Erişim" sayfası gösterilebilir.
    return <Navigate to="/" />;
  }

  // Kullanıcı giriş yapmış ve doğru role sahipse, alt rotaları göster.
  return <Outlet />;
};

export default ProtectedRoute;