export interface User {
    name: string;
}

export interface Message {
    name: string;
    message: string;
    timestamp?: string;
}

export interface ConnectedUsers {
    [socketId: string]: User;
}

export type SocketEvent = 
    | 'name'
    | 'typing'
    | 'message'
    | 'someoneConnected'
    | 'someoneDisconnect'
    | 'someoneTyping'
    | 'newMessage'
    | 'connectedsUpdate';

export interface ServerConfig {
    port: number;
    corsOrigin: string;
    maxMessageLength: number;
    maxNameLength: number;
    messageHistoryLimit: number;
    logLevel: string;
}
