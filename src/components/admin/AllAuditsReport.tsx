import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Tür tanımlamaları
interface Audit {
  id: string;
  storeId: string;
  formTemplateId: string;
  auditorId: string;
  completedAt: { toDate: () => Date };
  totalScore: number;
  storeName?: string;
  formTitle?: string;
  auditorName?: string;
}

const AllAuditsReport = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Tüm gerekli verileri tek seferde çek
        const [auditSnapshot, usersSnapshot, storesSnapshot, templatesSnapshot] = await Promise.all([
          getDocs(collection(db, 'audits')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'stores')),
          getDocs(collection(db, 'formTemplates'))
        ]);

        // Verileri haritalara dönüştürerek kolay erişim sağla
        const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));
        const storesMap = new Map(storesSnapshot.docs.map(doc => [doc.id, doc.data()]));
        const templatesMap = new Map(templatesSnapshot.docs.map(doc => [doc.id, doc.data()]));

        // Denetim verilerini zenginleştir
        const fetchedAudits = auditSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            storeName: storesMap.get(data.storeId)?.name || 'Bilinmeyen Mağaza',
            formTitle: templatesMap.get(data.formTemplateId)?.title || 'Bilinmeyen Form',
            auditorName: usersMap.get(data.auditorId)?.displayName || 'Bilinmeyen Denetçi',
          } as Audit;
        });

        setAudits(fetchedAudits);

      } catch (error) {
        console.error("Tüm denetimler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const filteredAudits = useMemo(() => {
    if (!filter) return audits;
    return audits.filter(audit =>
      audit.storeName?.toLowerCase().includes(filter.toLowerCase()) ||
      audit.auditorName?.toLowerCase().includes(filter.toLowerCase()) ||
      audit.formTitle?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [audits, filter]);

  if (loading) {
    return <div className="p-6">Raporlar yükleniyor...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4">Tüm Denetim Raporları</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Mağaza, denetçi veya form adına göre filtrele..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">Mağaza</th>
              <th className="py-2 px-4 text-left">Denetçi</th>
              <th className="py-2 px-4 text-left">Form</th>
              <th className="py-2 px-4 text-left">Tarih</th>
              <th className="py-2 px-4 text-center">Puan</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map((audit) => (
              <tr key={audit.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{audit.storeName}</td>
                <td className="py-2 px-4">{audit.auditorName}</td>
                <td className="py-2 px-4">{audit.formTitle}</td>
                <td className="py-2 px-4">{audit.completedAt.toDate().toLocaleDateString('tr-TR')}</td>
                <td className="py-2 px-4 text-center font-semibold">{audit.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAudits.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-4">Filtreyle eşleşen denetim bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default AllAuditsReport;