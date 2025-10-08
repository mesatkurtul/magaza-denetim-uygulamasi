import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

interface FormTemplate {
  id: string;
  title: string;
  description: string;
}

const SelectFormTemplatePage = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const templatesCollectionRef = collection(db, 'formTemplates');
        const q = query(templatesCollectionRef, where('isActive', '==', true));
        const data = await getDocs(q);
        const fetchedTemplates = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as FormTemplate));
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Aktif form şablonları çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/audit/new/select-store?formTemplateId=${templateId}`);
  };

  if (loading) {
    return <div className="p-8">Aktif form şablonları yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Yeni Denetim Başlat</h1>
      <p className="mt-2 text-gray-600">1. Adım: Lütfen bir denetim şablonu seçin.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-blue-500"
            >
              <LayoutGrid className="w-8 h-8 text-blue-500 mb-3" />
              <h2 className="text-xl font-semibold text-gray-800">{template.title}</h2>
              <p className="text-gray-600 mt-2">{template.description}</p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">Kullanılabilir aktif denetim şablonu bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default SelectFormTemplatePage;