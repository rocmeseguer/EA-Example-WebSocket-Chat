// services/chat.ts
import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from './logger.js';
import { createReducer, createInitialState, ChatAction } from '../state/store.js';
import type { ServerConfig, Message } from '../models/models.js';

export const setupChatWebsocket = (httpServer: HttpServer, config: ServerConfig) => {
    // 1. Inicialitzem Socket.io
    const io = new SocketServer(httpServer, {
        cors: { origin: config.corsOrigin || "*" }
    });

    // 2. Inicialitzem el Store (Estat + Reducer)
    let state = createInitialState();
    const reducer = createReducer();

    // Funció Helper per simular Redux
    const dispatch = (action: ChatAction) => {
        state = reducer(state, action);
    };

    // 3. Escoltem connexions
    io.on('connection', (socket: Socket) => {
        logger.info({ socketId: socket.id }, '🟢 Nou client connectat');

        // --- A. Gestió del Nom ---
        socket.on('name', (name: string) => {
            // Netegem el nom o assignem un per defecte
            const cleanName = (name?.trim() || `Guest_${socket.id.substring(0, 4)}`).slice(0, config.maxNameLength || 32);
            
            // Actualitzem l'estat global
            dispatch({ type: 'USER_CONNECTED', payload: { socketId: socket.id, name: cleanName } });
            
            // Emetem els canvis
            io.emit('someoneConnected', cleanName);
            io.emit('connectedsUpdate', state.connectedUsers);
        });

        // --- B. Gestió de Missatges ---
        socket.on('message', (content: string) => {
            if (!content?.trim()) return;

            const user = state.connectedUsers[socket.id];
            const userName = user ? user.name : `Guest_${socket.id.substring(0, 4)}`;
            const cleanContent = content.trim().slice(0, config.maxMessageLength || 1024);
            
            const message: Message = { 
                name: userName, 
                message: cleanContent, 
                timestamp: new Date().toISOString() 
            };
            
            dispatch({ type: 'MESSAGE_ADDED', payload: message });
            io.emit('newMessage', message);
        });

        // --- C. Gestió d'Escriptura ---
        socket.on('typing', () => {
            const user = state.connectedUsers[socket.id];
            if (user) {
                socket.broadcast.emit('someoneTyping', user.name);
            }
        });

        // --- D. Gestió de Desconnexions ---
        socket.on('disconnect', (reason: string) => {
            logger.info({ socketId: socket.id, reason }, '🔴 Client desconnectat');
            const user = state.connectedUsers[socket.id];
            
            if (user) {
                dispatch({ type: 'USER_DISCONNECTED', payload: { socketId: socket.id } });
                io.emit('someoneDisconnect', user.name);
                io.emit('connectedsUpdate', state.connectedUsers);
            }
        });

        socket.on('error', (error: Error) => {
            logger.error({ socketId: socket.id, error: error.message }, 'Socket error');
        });
    });

    return io;
};