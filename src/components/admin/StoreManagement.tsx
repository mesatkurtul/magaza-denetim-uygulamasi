import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

// Store tür tanımı
interface Store {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

const StoreManagement = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Partial<Store> | null>(null);

  const storesCollectionRef = collection(db, 'stores');

  const fetchStores = async () => {
    setLoading(true);
    const data = await getDocs(storesCollectionRef);
    const fetchedStores = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Store));
    setStores(fetchedStores);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openModal = (store: Partial<Store> | null = null) => {
    setCurrentStore(store || { name: '', address: '', isActive: true });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStore(null);
  };

  const handleSave = async () => {
    if (!currentStore || !currentStore.name) {
      alert("Mağaza adı boş bırakılamaz.");
      return;
    }

    if (currentStore.id) {
      // Güncelleme
      const storeDoc = doc(db, 'stores', currentStore.id);
      const { id, ...dataToUpdate } = currentStore;
      await updateDoc(storeDoc, dataToUpdate);
    } else {
      // Ekleme
      await addDoc(storesCollectionRef, { ...currentStore, createdAt: serverTimestamp() });
    }

    closeModal();
    fetchStores(); // Listeyi yenile
  };

  const handleDelete = async (id: string) => {
    if(window.confirm("Bu mağazayı silmek istediğinizden emin misiniz?")){
      const storeDoc = doc(db, 'stores', id);
      await deleteDoc(storeDoc);
      fetchStores(); // Listeyi yenile
    }
  };

  if (loading) {
    return <div>Mağazalar yükleniyor...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mağaza Yönetimi</h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Yeni Mağaza Ekle
        </button>
      </div>

      {/* Mağaza Listesi */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b text-left">Mağaza Adı</th>
              <th className="py-2 px-4 border-b text-left">Adres</th>
              <th className="py-2 px-4 border-b text-center">Durum</th>
              <th className="py-2 px-4 border-b text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="py-2 px-4 border-b">{store.name}</td>
                <td className="py-2 px-4 border-b">{store.address}</td>
                <td className="py-2 px-4 border-b text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${store.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {store.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-right">
                  <button onClick={() => openModal(store)} className="text-blue-600 hover:text-blue-800 mr-2">Düzenle</button>
                  <button onClick={() => handleDelete(store.id)} className="text-red-600 hover:text-red-800">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Store */}
      {isModalOpen && currentStore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{currentStore.id ? 'Mağazayı Düzenle' : 'Yeni Mağaza Ekle'}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Mağaza Adı</label>
                <input
                  type="text"
                  id="name"
                  value={currentStore.name || ''}
                  onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adres</label>
                <textarea
                  id="address"
                  value={currentStore.address || ''}
                  onChange={(e) => setCurrentStore({ ...currentStore, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={currentStore.isActive || false}
                  onChange={(e) => setCurrentStore({ ...currentStore, isActive: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Aktif</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">İptal</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;