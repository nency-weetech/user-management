import { OrganizationPlanEnum } from '../enums/organization.plan.enum';

export const ORGANIZATIOPN_PLAN_CONFIG = {
  [OrganizationPlanEnum.FREE]: {
    name: 'free',
    price: 0,
    bookmarkLimit: 50
  },
  [OrganizationPlanEnum.PRO]: {
    name: 'pro',
    price: 499,
    bookmarkLimit: 100
  },
  [OrganizationPlanEnum.MAX]: {
    name: 'max',
    price: 999,
    bookmarkLimit: null
  },
};
