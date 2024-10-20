"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = __importDefault(require("socket.io"));
const app = (0, express_1.default)();
app.use(express_1.default.static('public'));
const server = app.listen(3000, () => {
    console.log('Listening at localhost:3000');
});
const io = new socket_io_1.default.Server(server, {
    cors: {
        origin: "*"
    }
});
const usersConnected = {};
io.on('connection', (socket) => {
    const user = { name: `Guest_${socket.id}` };
    socket.on('typing', (id) => {
        socket.broadcast.emit('someoneTyping', usersConnected[id].name);
    });
    socket.on('name', (name) => {
        usersConnected[socket.id] = user;
        if (name) {
            user.name = name;
        }
        socket.broadcast.emit('someoneConnected', user.name);
        io.emit('connectedsUpdate', usersConnected);
    });
    socket.on('message', (message) => {
        if (message) {
            socket.broadcast.emit('newMessage', { name: user.name, message });
        }
    });
    socket.on('disconnect', (reason) => {
        io.emit('someoneDisconnect', user.name);
        delete usersConnected[socket.id];
        io.emit('connectedsUpdate', usersConnected);
    });
});
