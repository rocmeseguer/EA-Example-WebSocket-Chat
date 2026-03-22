// state/store.ts
import type { ConnectedUsers, Message } from '../models/models.js';

export interface ChatState {
    connectedUsers: ConnectedUsers;
    messageHistory: Message[];
}

export const createInitialState = (): ChatState => ({
    connectedUsers: {},
    messageHistory: []
});

// Afegim l'export aquí per poder tipar el "dispatch"
export type ChatAction =
    | { type: 'USER_CONNECTED'; payload: { socketId: string; name: string } }
    | { type: 'USER_DISCONNECTED'; payload: { socketId: string } }
    | { type: 'MESSAGE_ADDED'; payload: Message }
    | { type: 'USERS_UPDATED'; payload: ConnectedUsers };

export const createReducer = () => (
    state: ChatState,
    action: ChatAction
): ChatState => {
    switch (action.type) {
        case 'USER_CONNECTED':
            return {
                ...state,
                connectedUsers: {
                    ...state.connectedUsers,
                    [action.payload.socketId]: { name: action.payload.name }
                }
            };
        case 'USER_DISCONNECTED': {
            const { [action.payload.socketId]: _, ...remainingUsers } = state.connectedUsers;
            return { ...state, connectedUsers: remainingUsers };
        }
        case 'MESSAGE_ADDED':
            return {
                ...state,
                messageHistory: [...state.messageHistory, action.payload]
            };
        case 'USERS_UPDATED':
            return { ...state, connectedUsers: action.payload };
        default:
            return state;
    }
};

export const getLastMessages = (history: Message[], limit: number): Message[] => history.slice(-limit);
export const getUserBySocketId = (users: ConnectedUsers, socketId: string): string | undefined => users[socketId]?.name;