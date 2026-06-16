import { useFirestoreQuery } from './useFirestoreQuery';
import { getCareerPathById, getCareerTools, CareerPath } from '@/lib/firebase/career-helpers';

export function useCareerPathQuery(pathId: string | undefined) {
  return useFirestoreQuery<CareerPath | null>(
    ['career-path', pathId || ''],
    async () => {
      if (!pathId) return null;
      return getCareerPathById(pathId);
    },
    { 
      staleTime: 300000,
      enabled: !!pathId 
    }
  );
}

export function useCareerToolsQuery(careerCluster?: string) {
  return useFirestoreQuery<any[]>(
    ['career-tools', careerCluster || 'all'],
    async () => {
      return getCareerTools(careerCluster);
    },
    { 
      staleTime: 300000,
      // We might want it always enabled if we want all tools when no cluster is provided
    }
  );
}
