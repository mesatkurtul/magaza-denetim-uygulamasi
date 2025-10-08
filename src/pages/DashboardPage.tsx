import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, History } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleStartAudit = () => {
    navigate('/audit/new/select-form');
  };

  const handleViewHistory = () => {
    navigate('/my-audits');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Denetçi Paneli</h1>
        <p className="mt-2 text-gray-600">Hoş geldiniz. Buradan yeni denetimler başlatabilir ve geçmiş denetimlerinizi görüntüleyebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yeni Denetim Başlat Kartı */}
        <div
          className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleStartAudit}
        >
          <FilePlus2 className="w-16 h-16 text-blue-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Yeni Denetim Başlat</h2>
          <p className="text-gray-500 mt-1">Yeni bir mağaza denetimi başlatmak için tıklayın.</p>
        </div>

        {/* Geçmiş Denetimlerim Kartı */}
        <div
          className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleViewHistory}
        >
          <History className="w-16 h-16 text-green-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Geçmiş Denetimlerim</h2>
          <p className="text-gray-500 mt-1">Tamamladığınız denetimleri görüntüleyin.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;