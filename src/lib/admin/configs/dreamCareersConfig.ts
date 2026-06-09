import { Timestamp } from 'firebase/firestore';
import type { AdminConfig, AdminCareerPath } from '@/types/admin';

export const dreamCareersConfig: AdminConfig<AdminCareerPath> = {
  entityName: 'Career Path',
  entityNamePlural: 'Career Paths',
  collectionName: 'career_paths',

  createEmpty: () => ({
    userId: '',
    careerName: '',
  }),

  getId: (entity) => entity.id,
  getTitle: (entity) => entity.careerName || entity.title || 'Untitled',
  getStatus: () => 'published',
  getDomain: (entity) => entity.archetypes?.[0] || 'General',
  getSubtitle: (entity) => entity.userId,
  getSearchText: (entity) => `${entity.careerName} ${entity.userId}`.toLowerCase(),

  availableStatuses: ['all'],

  getAvailableDomains: (entities) => {
    const domains = new Set<string>();
    for (const entity of entities) {
      if (entity.archetypes?.[0]) {
        domains.add(entity.archetypes[0]);
      }
    }
    return ['all', ...Array.from(domains)];
  },

  toFirestore: (entity) => {
    const data = { ...entity };
    delete (data as Record<string, unknown>).id;

    const firestoreData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) {
        firestoreData[key] = Timestamp.fromDate(value);
      } else {
        firestoreData[key] = value;
      }
    }

    return {
      ...firestoreData,
      updatedAt: new Date(),
    };
  },

  fromFirestore: (data: Record<string, unknown>, id: string): AdminCareerPath => {
    const result: Record<string, unknown> = { ...data, id };

    // Convert Firestore Timestamps back to Date objects
    if ('createdAt' in result && result.createdAt instanceof Timestamp) {
      result.createdAt = (result.createdAt as Timestamp).toDate();
    }
    if ('updatedAt' in result && result.updatedAt instanceof Timestamp) {
      result.updatedAt = (result.updatedAt as Timestamp).toDate();
    }

    return result as unknown as AdminCareerPath;
  },
};
