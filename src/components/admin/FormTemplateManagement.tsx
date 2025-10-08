import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
// import { useNavigate } from 'react-router-dom'; // Will be used later

// FormTemplate tür tanımı
interface FormTemplate {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

const FormTemplateManagement = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate(); // Will be used later

  const templatesCollectionRef = collection(db, 'formTemplates');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getDocs(templatesCollectionRef);
      const fetchedTemplates = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as FormTemplate));
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Form şablonları çekilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if(window.confirm("Bu form şablonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")){
      try {
        const templateDoc = doc(db, 'formTemplates', id);
        await deleteDoc(templateDoc);
        fetchTemplates(); // Listeyi yenile
      } catch (error) {
        console.error("Şablon silinirken hata oluştu:", error);
        alert("Şablon silinirken bir hata oluştu.");
      }
    }
  };

  const handleAddNew = () => {
    // navigate('/admin/forms/new'); // Later, this will navigate to the form editor
    alert("Yeni şablon ekleme özelliği yakında eklenecektir.");
  };

  const handleEdit = (id: string) => {
    // navigate(`/admin/forms/${id}`); // Later, this will navigate to the form editor
    alert("Şablon düzenleme özelliği yakında eklenecektir.");
  };

  if (loading) {
    return <div>Form şablonları yükleniyor...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Form Şablonu Yönetimi</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Yeni Şablon Ekle
        </button>
      </div>

      {/* Şablon Listesi */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b text-left">Şablon Adı</th>
              <th className="py-2 px-4 border-b text-left">Açıklama</th>
              <th className="py-2 px-4 border-b text-center">Durum</th>
              <th className="py-2 px-4 border-b text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="py-2 px-4 border-b">{template.title}</td>
                <td className="py-2 px-4 border-b">{template.description}</td>
                <td className="py-2 px-4 border-b text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${template.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {template.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-right">
                  <button onClick={() => handleEdit(template.id)} className="text-blue-600 hover:text-blue-800 mr-2">Düzenle</button>
                  <button onClick={() => handleDelete(template.id)} className="text-red-600 hover:text-red-800">Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {templates.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-4">Henüz form şablonu oluşturulmamış.</p>
        )}
      </div>
    </div>
  );
};

export default FormTemplateManagement;