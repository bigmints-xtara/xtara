"use client";

import { useQuery } from "@tanstack/react-query";
import type { QueryObserverResult } from "@tanstack/react-query";
import { getCareerPathById, CareerPath } from "@/lib/firebase/career-helpers";

const CAREER_PATH_STALE_TIME = 5 * 60 * 1000;
const CAREER_PATH_CACHE_TIME = 15 * 60 * 1000;

interface UseCareerPathResult {
  data: CareerPath | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

export function useCareerPath(pathId: string | null | undefined): UseCareerPathResult {
  const result = useQuery<CareerPath | null>({
    queryKey: ["careerPath", pathId],
    queryFn: async () => {
      if (!pathId) return null;
      return getCareerPathById(pathId);
    },
    enabled: !!pathId,
    staleTime: CAREER_PATH_STALE_TIME,
    gcTime: CAREER_PATH_CACHE_TIME,
    retry: 2,
  });

  return {
    data: result.data ?? null,
    isLoading: result.isLoading,
    error: result.error,
    refetch: () => result.refetch(),
  };
}
