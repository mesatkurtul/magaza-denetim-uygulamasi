import React from 'react';
import { Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Yönlendirme App.tsx'teki rota mantığı tarafından ele alınacak
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            {userProfile?.role === 'Admin' ? 'Admin Paneli' : 'Denetçi Paneli'}
          </h1>
          <div>
            <span className="text-gray-600 mr-4">Hoş geldin, {userProfile?.displayName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet /> {/* Nested routes will render here */}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;