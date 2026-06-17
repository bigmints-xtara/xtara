import { Timestamp } from 'firebase/firestore';
import { AdminConfig, Challenge } from '@/types/admin';

export const challengesConfig: AdminConfig<Challenge> = {
  entityName: 'Challenge',
  entityNamePlural: 'Challenges',
  collectionName: 'challenges',

  createEmpty: () => ({
    title: '',
    image: '',
    domain: '',
    published: false,
    draft: true,
    inReview: false,
    careerRelevance: [],
    type: '',
    rewardPerQuestion: 0,
    instructions: '',
    questions: [],
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
  getSearchText: (entity) => `${entity.title} ${entity.instructions}`.toLowerCase(),

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

  validateEntity: (entity) => {
    if (entity.rewardPerQuestion !== undefined && entity.rewardPerQuestion < 0) {
      return 'Reward per question must be 0 or greater';
    }
    if (entity.questions) {
      for (let i = 0; i < entity.questions.length; i++) {
        const q = entity.questions[i];
        if (!q.title || q.title.trim() === '') {
          return `Question ${i + 1}: Title is required`;
        }
        if (q.options.length < 2) {
          return `Question ${i + 1}: At least 2 options are required`;
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          return `Question ${i + 1}: Correct answer index must be between 0 and ${q.options.length - 1}`;
        }
      }
    }
    return null;
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

  fromFirestore: (data: Record<string, unknown>, id: string): Challenge => {
    const result: Record<string, unknown> = { ...data, id };

    // Convert Firestore Timestamps back to Date objects
    for (const key in result) {
      if (result[key] instanceof Timestamp) {
        result[key] = (result[key] as Timestamp).toDate();
      }
    }

    return result as unknown as Challenge;
  },
};
