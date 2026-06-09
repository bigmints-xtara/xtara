import { Timestamp } from 'firebase/firestore';
import { AdminConfig, GoodRead } from '@/types/admin';

export const goodReadsConfig: AdminConfig<GoodRead> = {
  entityName: 'Good Read',
  entityNamePlural: 'Good Reads',
  collectionName: 'good_reads',

  createEmpty: () => ({
    title: '',
    image: '',
    domain: '',
    published: false,
    draft: true,
    inReview: false,
    careerRelevance: [],
    type: '',
    content: '',
  }),

  getId: (entity) => entity.id,
  getTitle: (entity) => entity.title,
  getStatus: (entity) => {
    if (entity.published) return 'published';
    if (entity.inReview) return 'inReview';
    return 'draft';
  },
  getDomain: (entity) => entity.domain,
  getSubtitle: (entity) => entity.type,
  getSearchText: (entity) => `${entity.title} ${entity.content}`.toLowerCase(),

  availableStatuses: ['all', 'published', 'draft', 'inReview'],

  getAvailableDomains: (entities) => {
    const domains = new Set<string>();
    entities.forEach((entity) => {
      if (entity.domain) {
        domains.add(entity.domain);
      }
    });
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

  fromFirestore: (data: Record<string, unknown>, id: string): GoodRead => {
    const result: Record<string, unknown> = { ...data, id };

    // Convert Firestore Timestamps back to Date objects
    if ('publishedAt' in result && result.publishedAt instanceof Timestamp) {
      result.publishedAt = (result.publishedAt as Timestamp).toDate();
    }
    if ('publishedUntil' in result && result.publishedUntil instanceof Timestamp) {
      result.publishedUntil = (result.publishedUntil as Timestamp).toDate();
    }
    if ('createdAt' in result && result.createdAt instanceof Timestamp) {
      result.createdAt = (result.createdAt as Timestamp).toDate();
    }
    if ('updatedAt' in result && result.updatedAt instanceof Timestamp) {
      result.updatedAt = (result.updatedAt as Timestamp).toDate();
    }

    return result as unknown as GoodRead;
  },
};
