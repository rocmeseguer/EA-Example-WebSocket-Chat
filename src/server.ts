import express from 'express';
import socketIo from 'socket.io';

import {IUser} from './models/user';
import {IMessage} from './models/message';


const app = express();

app.use(express.static('public'));

const server = app.listen(3000, () => { 
    console.log('Listening at localhost:3000')
});

const io = new socketIo.Server(server,  {
    cors: {
      origin: "*"
    }
});

/**
 * Almacena los usuarios conectados actualmente
 * key: socket.id, value: IUser
 */
const usersConnected: { [key: string]: IUser } = {};

/**
 * Almacena el historial de mensajes del chat
 */
const messageHistory: IMessage[] = [];

/**
 * Obtiene los últimos N mensajes del historial
 * @param limit Número de mensajes a obtener
 * @returns Array con los últimos mensajes
 */
function getLastMessages(limit: number): IMessage[] {
    return messageHistory.slice(-limit);  
}

/**
 * Maneja la conexión de un nuevo cliente
 */
io.on('connection', (socket: socketIo.Socket) => {
    console.log(`Client connected: ${socket.id}`);
    const user: IUser = {name: `Guest_${socket.id}`};

    /**
     * Maneja el registro del nombre de usuario
     * @param name Nombre elegido por el usuario
     */
    socket.on('name', (name) => {
        usersConnected[socket.id] = user;

        if(name){
            user.name = name;
        }

        // Notifica a otros usuarios de la nueva conexión
        socket.broadcast.emit('someoneConnected', user.name);

        // Actualiza la lista de usuarios conectados para todos
        io.emit('connectedsUpdate', usersConnected);
    });

    /**
     * Notifica a otros usuarios cuando alguien está escribiendo
     * @param id ID del socket del usuario que está escribiendo
     */
    socket.on('typing', (id) => {
        socket.broadcast.emit('someoneTyping', usersConnected[id].name);
    });

    /**
     * Maneja el envío de mensajes
     * @param message Contenido del mensaje enviado
     */
    socket.on('message', (message) => {
        if(message){
            const newMessage: IMessage = {name: user.name, message: message}
            // Guarda el mensaje en el historial
            messageHistory.push(newMessage);

            // Transmite el mensaje a todos los demás usuarios
            socket.broadcast.emit('newMessage', newMessage);
        }
    });

    /**
     * Maneja errores del socket
     */
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });

    /**
     * Se ejecuta justo antes de la desconexión
     */
    socket.on('disconnecting', (reason) => {
        console.log(`Client ${socket.id} disconnecting: ${reason}`);
    });

    /**
     * Se ejecuta justo despues de la desconexión de un usuario
     * @param reason Motivo de la desconexión
     */
    socket.on('disconnect', (reason) => {
        console.log(`Client ${socket.id} disconnected: ${reason}`);
        // Notifica a todos los usuarios que alguien se desconectó
        io.emit('someoneDisconnect', user.name);

        // Elimina al usuario de la lista de conectados
        delete usersConnected[socket.id];

        // Actualiza la lista de usuarios conectados para todos
        io.emit('connectedsUpdate', usersConnected);
    });
});

/**
 * Maneja errores generales del servidor
 */
server.on('error', (error) => {
    console.error('Server error:', error);
});
