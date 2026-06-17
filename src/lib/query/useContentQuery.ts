import { useFirestoreQuery } from './useFirestoreQuery';
import { FirestoreService, Story, GoodRead, Challenge, Spark, GameInstance } from '@/lib/firebase/firestore-service';

const TWELVE_HOURS = 43200000;

export function useStoriesQuery(limitCount = 5) {
  return useFirestoreQuery<Story[]>(
    ['stories', limitCount],
    async () => {
      return FirestoreService.getStoriesForHome(limitCount);
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useGoodReadsQuery(limitCount = 5) {
  return useFirestoreQuery<GoodRead[]>(
    ['good-reads', limitCount],
    async () => {
      return FirestoreService.getGoodReadsForHome(limitCount);
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useChallengesQuery(limitCount = 5) {
  return useFirestoreQuery<Challenge[]>(
    ['challenges', limitCount],
    async () => {
      return FirestoreService.getChallengesForHome(limitCount);
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useSparksQuery(limitCount = 5) {
  return useFirestoreQuery<Spark[]>(
    ['sparks', limitCount],
    async () => {
      return FirestoreService.getSparksForHome(limitCount);
    },
    { staleTime: TWELVE_HOURS }
  );
}

export function useGamesQuery(limitCount = 5) {
  return useFirestoreQuery<GameInstance[]>(
    ['games', limitCount],
    async () => {
      return FirestoreService.getPlayableGames(limitCount);
    },
    { staleTime: TWELVE_HOURS }
  );
}
