import type { Message, ServerConfig } from '../models/models.js';

export const defaultConfig: ServerConfig = {
    port: 3000,
    corsOrigin: '*',
    maxMessageLength: 1024,
    maxNameLength: 32,
    messageHistoryLimit: 100,
    logLevel: 'info'
};

export const sanitizeInput = (input: string, maxLength: number): string => 
    input.trim().slice(0, maxLength);

export const generateGuestName = (socketId: string): string => 
    `Guest_${socketId}`;

export const createMessage = (name: string, content: string): Message => ({
    name,
    message: content,
    timestamp: new Date().toISOString()
});
