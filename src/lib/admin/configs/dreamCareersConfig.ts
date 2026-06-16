import { AdminConfig, AdminCareerPath } from '@/types/admin';

export const dreamCareersConfig: AdminConfig<AdminCareerPath> = {
  entityName: 'Career Path',
  entityNamePlural: 'Career Paths',
  collectionName: 'career_paths',
  hideNewButton: true,

  createEmpty: () => ({
    userId: '',
    careerName: '',
    title: '',
    description: '',
    archetypes: [],
  }),

  getId: (entity) => entity.id,
  getTitle: (entity) => entity.careerName || entity.title || 'Untitled',
  getSubtitle: (entity) => entity.userId || '',

  getStatus: (entity) => 'published',

  getDomain: (entity) => entity.archetypes?.[0] || 'General',

  getSearchText: (entity) => `${entity.careerName || ''} ${entity.title || ''} ${entity.userId || ''}`.toLowerCase(),

  availableStatuses: ['all'],

  getAvailableDomains: (entities) => {
    const domains = new Set<string>();
    entities.forEach((entity) => {
      if (entity.archetypes?.[0]) domains.add(entity.archetypes[0]);
    });
    return ['all', ...Array.from(domains)];
  },

  toFirestore: (entity) => {
    const data = { ...entity };
    delete data.id;
    return {
      ...data,
      updatedAt: new Date(),
    };
  },

  fromFirestore: (data, id) => {
    const serialized = JSON.parse(JSON.stringify(data));
    return {
      ...(serialized as AdminCareerPath),
      id,
    };
  },
};
