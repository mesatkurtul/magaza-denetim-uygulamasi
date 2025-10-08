import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import SelectFormTemplatePage from './pages/audit/SelectFormTemplatePage';
import SelectStorePage from './pages/audit/SelectStorePage';
import AuditPage from './pages/audit/AuditPage';
import MyAuditsPage from './pages/audit/MyAuditsPage';

function App() {
  const { loading } = useAuth(); // Sadece yükleme durumunu alıyoruz, yönlendirmeyi bileşenler kendi içinde yapacak.

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Yükleniyor...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Ana Rota: Kullanıcıyı rolüne göre yönlendirir */}
        <Route path="/" element={<HomePage />} />

        {/* Giriş Sayfası */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Rotaları */}
        <Route element={<ProtectedRoute requiredRole="Admin" />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            {/* Diğer admin rotaları buraya eklenebilir. Örn: /admin/stores, /admin/forms */}
          </Route>
        </Route>

        {/* Denetçi Rotaları */}
        <Route element={<ProtectedRoute requiredRole="Auditor" />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/my-audits" element={<MyAuditsPage />} />
            <Route path="/audit/new/select-form" element={<SelectFormTemplatePage />} />
            <Route path="/audit/new/select-store" element={<SelectStorePage />} />
            <Route path="/audit/start" element={<AuditPage />} />
             {/* Diğer denetçi rotaları buraya eklenebilir. */}
          </Route>
        </Route>

        {/* Eşleşmeyen rotalar için bir fallback eklenebilir, örneğin 404 sayfası */}
        <Route path="*" element={<div>404 - Sayfa Bulunamadı</div>} />
      </Routes>
    </Router>
  );
}

export default App;