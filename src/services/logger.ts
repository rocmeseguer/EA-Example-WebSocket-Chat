import pino from 'pino';
import type { ServerConfig } from '../models/models.js';

export const createLogger = (config: Pick<ServerConfig, 'logLevel'>) => pino({
    level: config.logLevel,
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        },
    },
});

export const logger = createLogger({ logLevel: 'info' });
