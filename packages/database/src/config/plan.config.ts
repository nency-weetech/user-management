import { UserPlanEnum } from '../enums/user-plan.enum'; 

export const PLAN_CONFIG = {
  [UserPlanEnum.FREE]: {
    name: 'Free',
    price: 0,
    dailyViewLimit: 20,
    dailyFetchLimit: 30,
    profileLimit: 3,
    bookmarkLimit: 10
  },
  [UserPlanEnum.PRO]: {
    name: 'Pro',
    price: 99,
    dailyViewLimit: 100,
    dailyFetchLimit: 60,
    profileLimit: 10,
    bookmarkLimit: 50
  },
  [UserPlanEnum.MAX]: {
    name: 'Max',
    price: 299,
    dailyViewLimit: null,
    dailyFetchLimit: null,
    profileLimit: null,
    bookmarkLimit: null
  },
} as const;