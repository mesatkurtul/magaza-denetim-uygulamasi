import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Tür tanımlamalarını genişletiyoruz
interface Option {
  text: string;
  score: number;
}

interface Question {
  questionId: string;
  text: string;
  type: 'multiple-choice' | 'text' | 'number' | 'date' | 'time';
  options?: Option[];
  order: number;
}

interface Category {
  categoryId: string;
  name: string;
  order: number;
  questions: Question[];
}

interface FormTemplate {
  title: string;
  categories: Category[];
}

interface Store {
  name: string;
}

interface Answer {
  questionId: string;
  answer: any;
  score: number;
}

const AuditPage = () => {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const params = new URLSearchParams(location.search);
  const formTemplateId = params.get('formTemplateId');
  const storeId = params.get('storeId');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!formTemplateId || !storeId || !userProfile) {
      setError("Gerekli bilgiler eksik. Lütfen denetim akışını baştan başlatın.");
      setLoading(false);
      return;
    }

    try {
      // Form şablonunu çek
      const templateDocRef = doc(db, 'formTemplates', formTemplateId);
      const templateDoc = await getDoc(templateDocRef);
      if (!templateDoc.exists()) throw new Error("Form şablonu bulunamadı.");
      setTemplate(templateDoc.data() as FormTemplate);

      // Mağaza bilgilerini çek
      const storeDocRef = doc(db, 'stores', storeId);
      const storeDoc = await getDoc(storeDocRef);
      if (!storeDoc.exists()) throw new Error("Mağaza bulunamadı.");
      setStore(storeDoc.data() as Store);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formTemplateId, storeId, userProfile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnswerChange = (questionId: string, answer: any, score: number = 0) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, answer, score }
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(answers).reduce((total, ans) => total + (ans.score || 0), 0);
  };

  const handleSubmitAudit = async () => {
     if (!formTemplateId || !storeId || !userProfile) return;

     const totalScore = calculateTotalScore();
     const auditData = {
        formTemplateId,
        storeId,
        auditorId: userProfile.uid,
        status: 'completed',
        startedAt: serverTimestamp(), // Daha doğru bir başlangıç zamanı için state'e eklenebilir
        completedAt: serverTimestamp(),
        totalScore,
        answers: Object.values(answers)
     };

     try {
        await addDoc(collection(db, 'audits'), auditData);
        alert(`Denetim başarıyla tamamlandı! Toplam Puan: ${totalScore}`);
        navigate('/dashboard');
     } catch (err) {
        console.error("Denetim kaydedilirken hata oluştu:", err);
        alert("Denetim kaydedilirken bir hata oluştu.");
     }
  };

  if (loading) return <div className="p-8">Denetim verileri yükleniyor...</div>;
  if (error) return <div className="p-8 text-red-600">Hata: {error}</div>;
  if (!template || !store) return <div className="p-8">Veriler yüklenemedi.</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{template.title}</h1>
        <h2 className="text-xl text-gray-600">Mağaza: {store.name}</h2>
      </div>

      <div className="space-y-8">
        {template.categories.sort((a, b) => a.order - b.order).map(category => (
          <div key={category.categoryId} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold border-b pb-2 mb-4">{category.name}</h3>
            <div className="space-y-6">
              {category.questions.sort((a, b) => a.order - b.order).map(q => (
                <div key={q.questionId}>
                  <label className="block text-md font-medium text-gray-800">{q.text}</label>
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="mt-2 space-y-2">
                      {q.options.map(opt => (
                        <label key={opt.text} className="flex items-center">
                          <input
                            type="radio"
                            name={q.questionId}
                            value={opt.text}
                            onChange={() => handleAnswerChange(q.questionId, opt.text, opt.score)}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                          />
                          <span className="ml-3 text-gray-700">{opt.text} (Puan: {opt.score})</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'text' && (
                     <textarea
                        onChange={(e) => handleAnswerChange(q.questionId, e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                     />
                  )}
                  {/* Diğer input tipleri (number, date, time) buraya eklenebilir */}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 flex justify-end">
          <button
            onClick={handleSubmitAudit}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700"
          >
            Denetimi Bitir ve Kaydet
          </button>
      </div>
    </div>
  );
};

export default AuditPage;