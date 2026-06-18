import { useFirestoreQuery } from './useFirestoreQuery';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { CareerPath } from '@/types/career';

export function useCareerPathQuery(pathId: string) {
  return useFirestoreQuery<CareerPath>(
    ['career-path', pathId],
    async () => {
      const snap = await getDoc(doc(db, 'career_paths', pathId));
      if (!snap.exists()) throw new Error('Career path not found');
      return { id: snap.id, ...snap.data() } as CareerPath;
    },
    { staleTime: 300000 }
  );
}
