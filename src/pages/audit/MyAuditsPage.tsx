import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Tür tanımlamaları
interface Audit {
  id: string;
  storeId: string;
  formTemplateId: string;
  completedAt: { toDate: () => Date };
  totalScore: number;
  storeName?: string; // Sonradan eklenecek
  formTitle?: string; // Sonradan eklenecek
}

const MyAuditsPage = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProfile) return;

    const fetchMyAudits = async () => {
      setLoading(true);
      try {
        // 1. Kullanıcıya ait denetimleri çek
        const auditsRef = collection(db, 'audits');
        const q = query(auditsRef, where('auditorId', '==', userProfile.uid));
        const auditSnapshot = await getDocs(q);
        let fetchedAudits = auditSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Audit));

        // 2. İlgili mağaza ve form bilgilerini toplu halde çekmek için ID'leri topla
        const storeIds = [...new Set(fetchedAudits.map(a => a.storeId))];
        const templateIds = [...new Set(fetchedAudits.map(a => a.formTemplateId))];

        const fetchDocData = async (collectionName: string, ids: string[]) => {
          const dataMap = new Map<string, any>();
          if (ids.length === 0) return dataMap;
          const promises = ids.map(id => getDoc(doc(db, collectionName, id)));
          const docs = await Promise.all(promises);
          docs.forEach(doc => {
            if (doc.exists()) {
              dataMap.set(doc.id, doc.data());
            }
          });
          return dataMap;
        };

        const storesMap = await fetchDocData('stores', storeIds);
        const templatesMap = await fetchDocData('formTemplates', templateIds);

        // 3. Denetim listesini mağaza ve form isimleriyle zenginleştir
        fetchedAudits = fetchedAudits.map(audit => ({
          ...audit,
          storeName: storesMap.get(audit.storeId)?.name || 'Bilinmeyen Mağaza',
          formTitle: templatesMap.get(audit.formTemplateId)?.title || 'Bilinmeyen Form',
        }));

        setAudits(fetchedAudits);

      } catch (error) {
        console.error("Geçmiş denetimler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAudits();
  }, [userProfile]);

  const handleViewDetails = (auditId: string) => {
    // navigate(`/audits/${auditId}`); // Detay sayfası eklendiğinde aktif olacak
    alert(`Denetim Detayı Görüntülenecek: ID ${auditId}\nBu özellik yakında eklenecektir.`);
  };

  if (loading) {
    return <div className="p-8">Geçmiş denetimler yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Geçmiş Denetimlerim</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-left">Mağaza Adı</th>
              <th className="py-3 px-6 text-left">Denetim Formu</th>
              <th className="py-3 px-6 text-left">Tarih</th>
              <th className="py-3 px-6 text-center">Puan</th>
              <th className="py-3 px-6 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {audits.length > 0 ? (
              audits.map((audit) => (
                <tr key={audit.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6">{audit.storeName}</td>
                  <td className="py-3 px-6">{audit.formTitle}</td>
                  <td className="py-3 px-6">{audit.completedAt.toDate().toLocaleDateString('tr-TR')}</td>
                  <td className="py-3 px-6 text-center font-semibold">{audit.totalScore}</td>
                  <td className="py-3 px-6 text-right">
                    <button onClick={() => handleViewDetails(audit.id)} className="text-blue-600 hover:underline">Detayları Gör</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6">Henüz tamamlanmış bir denetiminiz bulunmuyor.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAuditsPage;