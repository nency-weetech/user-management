"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_CONFIG = void 0;
const user_plan_enum_1 = require("../enums/user-plan.enum");
exports.PLAN_CONFIG = {
    [user_plan_enum_1.UserPlanEnum.FREE]: {
        name: 'Free',
        price: 0,
        dailyViewLimit: 20,
        dailyFetchLimit: 30,
    },
    [user_plan_enum_1.UserPlanEnum.PRO]: {
        name: 'Pro',
        price: 99,
        dailyViewLimit: 100,
        dailyFetchLimit: 60,
    },
    [user_plan_enum_1.UserPlanEnum.MAX]: {
        name: 'Max',
        price: 299,
        dailyViewLimit: null,
        dailyFetchLimit: null,
    },
};
