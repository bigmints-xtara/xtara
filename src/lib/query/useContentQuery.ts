"use client";

import { useQuery } from "@tanstack/react-query";
import { FirestoreService, Story, GoodRead, Challenge, Spark } from "@/lib/firebase/firestore-service";

const STALE_TIME_12H = 43_200_000;
const GC_TIME_24H = 86_400_000;

export function useStories(limit: number = 5) {
  return useQuery<Story[], Error>({
    queryKey: ["content", "stories", { limit }],
    queryFn: () => FirestoreService.getStoriesForHome(limit),
    staleTime: STALE_TIME_12H,
    gcTime: GC_TIME_24H,
    retry: 2,
  });
}

export function useGoodReads(limit: number = 5) {
  return useQuery<GoodRead[], Error>({
    queryKey: ["content", "goodReads", { limit }],
    queryFn: () => FirestoreService.getGoodReadsForHome(limit),
    staleTime: STALE_TIME_12H,
    gcTime: GC_TIME_24H,
    retry: 2,
  });
}

export function useChallenges(limit: number = 5) {
  return useQuery<Challenge[], Error>({
    queryKey: ["content", "challenges", { limit }],
    queryFn: () => FirestoreService.getChallengesForHome(limit),
    staleTime: STALE_TIME_12H,
    gcTime: GC_TIME_24H,
    retry: 2,
  });
}

export function useSparks(limit: number = 5) {
  return useQuery<Spark[], Error>({
    queryKey: ["content", "sparks", { limit }],
    queryFn: () => FirestoreService.getSparksForHome(limit),
    staleTime: STALE_TIME_12H,
    gcTime: GC_TIME_24H,
    retry: 2,
  });
}
