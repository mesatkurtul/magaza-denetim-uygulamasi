import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Kullanıcı verilerimiz için bir tür tanımı
export interface UserProfile extends DocumentData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'Admin' | 'Auditor';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı giriş yapmış. Firestore'dan profil bilgilerini çek.
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
        setUser(firebaseUser);
      } else {
        // Kullanıcı çıkış yapmış.
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userProfile, loading };
};