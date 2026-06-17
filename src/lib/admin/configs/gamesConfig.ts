import { Timestamp } from 'firebase/firestore';
import { AdminConfig, GameInstance } from '@/types/admin';

export const gamesConfig: AdminConfig<GameInstance> = {
  entityName: 'Game',
  entityNamePlural: 'Games',
  collectionName: 'game_instances',

  createEmpty: () => ({
    title: '',
    mode: 'quiz',
    isPublished: false,
    schedule: {
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 86400000 * 7), // 7 days from now
    },
  }),

  getId: (entity) => entity.id,
  getTitle: (entity) => entity.title,
  getSubtitle: (entity) => entity.mode,
  getStatus: (entity) => (entity.isPublished ? 'published' : 'draft'),
  getDomain: (entity) => entity.mode,
  getSearchText: (entity) => `${entity.title} ${entity.mode}`.toLowerCase(),

  availableStatuses: ['all', 'published', 'draft'],
  getAvailableDomains: (_entities) => ['all', 'quiz', 'puzzle', 'memory'],

  toFirestore: (entity) => {
    const data = { ...entity };
    delete (data as any).id;
    
    // Ensure nested schedule dates are JS Dates for Firestore SDK
    if (data.schedule) {
      if (!(data.schedule.startDateTime instanceof Date) && (data.schedule.startDateTime as any)?.toDate) {
        data.schedule.startDateTime = (data.schedule.startDateTime as any).toDate();
      } else if (typeof data.schedule.startDateTime === 'string') {
        data.schedule.startDateTime = new Date(data.schedule.startDateTime);
      }

      if (!(data.schedule.endDateTime instanceof Date) && (data.schedule.endDateTime as any)?.toDate) {
        data.schedule.endDateTime = (data.schedule.endDateTime as any).toDate();
      } else if (typeof data.schedule.endDateTime === 'string') {
        data.schedule.endDateTime = new Date(data.schedule.endDateTime);
      }
    }

    return {
      ...data,
      updatedAt: new Date(),
    };
  },

  fromFirestore: (data: Record<string, unknown>, id: string): GameInstance => {
    const instance = { ...data, id } as any;

    if (instance.schedule) {
      if (instance.schedule.startDateTime instanceof Timestamp) {
        instance.schedule.startDateTime = instance.schedule.startDateTime.toDate();
      }
      if (instance.schedule.endDateTime instanceof Timestamp) {
        instance.schedule.endDateTime = instance.schedule.endDateTime.toDate();
      }
    }

    if (instance.createdAt instanceof Timestamp) {
      instance.createdAt = instance.createdAt.toDate();
    }
    if (instance.updatedAt instanceof Timestamp) {
      instance.updatedAt = instance.updatedAt.toDate();
    }

    return instance as GameInstance;
  },
};
