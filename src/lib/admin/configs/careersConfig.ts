import { AdminConfig, AdminCareerPath } from '@/types/admin';

export const careersConfig: AdminConfig<AdminCareerPath> = {
  entityName: 'Career Path',
  entityNamePlural: 'Career Paths',
  collectionName: 'career_paths',

  createEmpty: () => ({
    userId: '',
    careerName: '',
    title: '',
    description: '',
  }),

  getId: (entity) => entity.userId,
  getTitle: (entity) => entity.careerName || entity.title || 'Untitled',
  getSubtitle: (entity) => entity.userId,

  getStatus: (entity) => {
    if (!entity.updatedAt && entity.createdAt) return 'created';
    if (entity.updatedAt && entity.updatedAt > (entity.createdAt || entity.updatedAt)) return 'updated';
    return 'archived';
  },

  getDomain: (entity) => entity.userId || entity.careerName || 'General',

  getSearchText: (entity) => {
    const parts = [entity.userId, entity.careerName, entity.title, entity.description].filter(Boolean);
    return parts.join(' ').toLowerCase();
  },

  availableStatuses: ['created', 'updated', 'archived'],

  getAvailableDomains: (entities) => {
    const domains = new Set<string>();
    entities.forEach(entity => {
      if (entity.userId) domains.add(entity.userId);
    });
    return ['all', ...Array.from(domains)];
  },

  validateEntity: (entity) => {
    if (!entity.careerName) return 'Missing career name';
    if (!entity.userId) return 'Missing user ID';
    return null;
  },

  toFirestore: (entity) => {
    const data = { ...entity };
    delete data.userId;
    return {
      ...data,
      updatedAt: new Date(),
    };
  },

  fromFirestore: (data, id) => ({
    ...(data as unknown as AdminCareerPath),
    userId: id,
  }),
};
