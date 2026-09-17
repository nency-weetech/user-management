export declare const PLAN_CONFIG: {
    readonly free: {
        readonly name: "Free";
        readonly price: 0;
        readonly dailyViewLimit: 20;
        readonly dailyFetchLimit: 30;
        readonly profileLimit: 3;
        readonly bookmarkLimit: 10;
    };
    readonly pro: {
        readonly name: "Pro";
        readonly price: 99;
        readonly dailyViewLimit: 100;
        readonly dailyFetchLimit: 60;
        readonly profileLimit: 10;
        readonly bookmarkLimit: 50;
    };
    readonly max: {
        readonly name: "Max";
        readonly price: 299;
        readonly dailyViewLimit: any;
        readonly dailyFetchLimit: any;
        readonly profileLimit: any;
        readonly bookmarkLimit: any;
    };
};
