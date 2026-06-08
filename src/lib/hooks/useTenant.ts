import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';

export type TenantType = 'individual' | 'institution';
export type TenantCategory = 'student' | 'parent' | 'career_coach' | 'mentor' | 'school' | 'college' | 'university';

export interface Tenant {
  id: string;
  type: TenantType;
  category: TenantCategory;
  displayName: string;
  avatarUrl?: string;
  authUserIds: string[];
  [key: string]: any;
}

export function useTenant() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setTenant(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: () => void;

    const fetchTenant = async () => {
      try {
        // Query tenants where authUserIds array-contains the current user's UID
        const q = query(
          collection(db, 'tenants'),
          where('authUserIds', 'array-contains', user.uid)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming a user is primarily active in one tenant context at a time for now.
          // In the future, we might allow switching tenants.
          // For now, we take the first matching tenant.
          const docRef = querySnapshot.docs[0].ref;
          
          unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
              setTenant({ id: doc.id, ...doc.data() } as Tenant);
            } else {
              setTenant(null);
            }
            setLoading(false);
          }, (err) => {
            console.error("Error listening to tenant:", err);
            setError(err);
            setLoading(false);
          });
          
        } else {
          setTenant(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching tenant:", err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching tenant'));
        setLoading(false);
      }
    };

    fetchTenant();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return { tenant, loading, error };
}
