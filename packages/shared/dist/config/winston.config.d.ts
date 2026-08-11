import * as winston from 'winston';
export declare const winstonConfig: {
    level: string;
    transports: (winston.transports.ConsoleTransportInstance | winston.transports.FileTransportInstance)[];
};
