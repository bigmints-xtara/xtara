import { useFirestoreQuery } from './useFirestoreQuery';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface CareerPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  matchScore: number;
  archetypes: string[];
  primaryCareer: any;
  careerPathway: any[];
  ragOutput: any;
  createdAt: any;
}

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
