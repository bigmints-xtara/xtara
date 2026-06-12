import { useFirestoreQuery } from './useFirestoreQuery';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const TWELVE_HOURS = 43200000;

export function useStoriesQuery() {
  return useFirestoreQuery<any[]>(
    ['stories'],
    async () => {
      const snap = await getDocs(collection(db, 'stories'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useGoodReadsQuery() {
  return useFirestoreQuery<any[]>(
    ['good-reads'],
    async () => {
      const snap = await getDocs(collection(db, 'good_reads'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useChallengesQuery() {
  return useFirestoreQuery<any[]>(
    ['challenges'],
    async () => {
      const snap = await getDocs(collection(db, 'challenges'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useSparksQuery() {
  return useFirestoreQuery<any[]>(
    ['sparks'],
    async () => {
      const snap = await getDocs(collection(db, 'sparks'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    { staleTime: TWELVE_HOURS }
  );
}
