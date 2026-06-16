import { AdminConfig, AdminCareerPath } from '@/types/admin';

export const dreamCareersConfig: AdminConfig<AdminCareerPath> = {
  entityName: 'Dream Career',
  entityNamePlural: 'Dream Careers',
  collectionName: 'dream_careers',
  hideNewButton: true,
  orderByField: 'title',
  orderByDirection: 'asc',

  createEmpty: () => ({
    userId: '',
    careerName: '',
    title: '',
    description: '',
    archetypes: [],
  }),

  getId: (entity) => entity.id,
  getTitle: (entity) => entity.title || entity.careerName || 'Untitled',
  getSubtitle: (entity) => (entity as any).careerCluster || entity.userId || '',

  getStatus: (entity) => 'published',

  getDomain: (entity) => entity.archetypes?.[0] || (entity as any).archetypeTags?.[0] || (entity as any).careerCluster || 'General',

  getSearchText: (entity) => `${entity.title || ''} ${entity.careerName || ''} ${(entity as any).careerCluster || ''} ${entity.description || ''}`.toLowerCase(),

  availableStatuses: ['all'],

  getAvailableDomains: (entities) => {
    const domains = new Set<string>();
    entities.forEach((entity) => {
      const dom = entity.archetypes?.[0] || (entity as any).archetypeTags?.[0] || (entity as any).careerCluster;
      if (dom) domains.add(dom);
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
