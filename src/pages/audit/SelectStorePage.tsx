import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  address: string;
}

const SelectStorePage = () => {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // URL'den formTemplateId'yi al
  const formTemplateId = new URLSearchParams(location.search).get('formTemplateId');

  useEffect(() => {
    if (!formTemplateId) {
      // Eğer form şablonu ID'si yoksa, kullanıcıyı ilk adıma geri yönlendir
      alert("Lütfen önce bir denetim şablonu seçin.");
      navigate('/audit/new/select-form');
      return;
    }

    const fetchStores = async () => {
      setLoading(true);
      try {
        const storesCollectionRef = collection(db, 'stores');
        const q = query(storesCollectionRef, where('isActive', '==', true));
        const data = await getDocs(q);
        const fetchedStores = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as StoreData));
        setStores(fetchedStores);
      } catch (error) {
        console.error("Aktif mağazalar çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [formTemplateId, navigate]);

  const handleSelectStore = (storeId: string) => {
    navigate(`/audit/start?formTemplateId=${formTemplateId}&storeId=${storeId}`);
  };

  if (loading) {
    return <div className="p-8">Aktif mağazalar yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Yeni Denetim Başlat</h1>
      <p className="mt-2 text-gray-600">2. Adım: Lütfen denetlenecek mağazayı seçin.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length > 0 ? (
          stores.map((store) => (
            <div
              key={store.id}
              onClick={() => handleSelectStore(store.id)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500"
            >
              <Store className="w-8 h-8 text-green-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">{store.name}</h2>
              <p className="text-gray-600 mt-2">{store.address}</p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Kullanılabilir aktif mağaza bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default SelectStorePage;