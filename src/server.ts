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

// Usuarios conectados
const usersConnected: { [key: string]: IUser } = {};

// Historial de mensajes
let messageHistory: IMessage[] = [];

// Función para obtener los últimos N mensajes
function getLastMessages(limit: number): IMessage[] {
    return messageHistory.slice(-limit);  
}

io.on('connection', (socket: socketIo.Socket) => {
    const user: IUser = {name: `Guest_${socket.id}`};

    socket.on('typing', (id) => {
        socket.broadcast.emit('someoneTyping', usersConnected[id].name);
    });

    socket.on('name', (name) => {
        usersConnected[socket.id] = user;

        if(name){
            user.name = name;
        }

        socket.broadcast.emit('someoneConnected', user.name);

        io.emit('connectedsUpdate', usersConnected);
    });

    socket.on('message', (message) => {
        if(message){
            const newMessage: IMessage = {name: user.name, message: message}
            messageHistory.push(newMessage);

            socket.broadcast.emit('newMessage', newMessage);
        }
    });

    socket.on('disconnect', (reason) => {
        io.emit('someoneDisconnect', user.name);

        delete usersConnected[socket.id];

        io.emit('connectedsUpdate', usersConnected);
    });
});