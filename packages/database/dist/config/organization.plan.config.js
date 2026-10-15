"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORGANIZATIOPN_PLAN_CONFIG = void 0;
const organization_plan_enum_1 = require("../enums/organization.plan.enum");
exports.ORGANIZATIOPN_PLAN_CONFIG = {
    [organization_plan_enum_1.OrganizationPlanEnum.FREE]: {
        name: 'free',
        price: 0,
        bookmarkLimit: 50
    },
    [organization_plan_enum_1.OrganizationPlanEnum.PRO]: {
        name: 'pro',
        price: 499,
        bookmarkLimit: 100
    },
    [organization_plan_enum_1.OrganizationPlanEnum.MAX]: {
        name: 'max',
        price: 999,
        bookmarkLimit: null
    },
};
