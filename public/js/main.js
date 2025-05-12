/**
 * CONFIGURACIÓN DE SOCKET.IO
 * Inicialización del cliente con opciones de reconexión
 */
const socket = io({
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
});

/**
 * ELEMENTOS UI
 * Creación y configuración de elementos de la interfaz
 */
// Formulario de mensaje
const formMessage = document.createElement('form');
formMessage.id = "formMessage";

const inputMessage = document.createElement('input');
inputMessage.maxLength = 1024;
inputMessage.id = 'm';
inputMessage.autocomplete = 'off';

const buttonSend = document.createElement('button');
buttonSend.innerHTML = 'Send';

// Formulario de nombre
const formName = document.createElement('form');
formName.id = 'formName';

const inputName = document.createElement('input');
inputName.maxLength = 32;
inputName.autocomplete = 'off';
inputName.placeholder = 'Name';

const buttonName = document.createElement('button');
buttonName.innerHTML = 'Ok';

// Contenedor de mensajes y usuarios online
const messagesContainer = document.createElement('ul');
messagesContainer.id = 'messages';

const div = document.createElement('div');
div.classList.add('messagesContainer');

const onlineDiv = document.createElement('div');
onlineDiv.classList.add('online');
const p = document.createElement('p');
p.innerHTML = 'Online Users';
const onlineList = document.createElement('ul');

// Estado de la conexión
const connectionStatus = document.getElementById('connection-status');

// Variables de estado
let myName = '';
const userTyping = document.createElement('li');
let hourTyping = new Date().getTime();
let typing = false;

/**
 * CONSTRUCCIÓN DE LA UI
 * Ensamblaje de los elementos creados
 */
formMessage.appendChild(inputMessage);
formMessage.appendChild(buttonSend);

formName.appendChild(inputName);
formName.appendChild(buttonName);

onlineDiv.appendChild(p);
onlineDiv.appendChild(onlineList);

div.appendChild(messagesContainer);
div.appendChild(formMessage);
div.appendChild(onlineDiv);

document.body.appendChild(formName);
inputName.focus();

/**
 * EVENT LISTENERS DE FORMULARIOS
 */
// Manejo del formulario de nombre
formName.addEventListener('submit', (event) => {
    event.preventDefault();
    myName = inputName.value ? inputName.value : 'Guest';
    socket.emit('name', inputName.value.slice(0, 32));
    
    formName.remove();
    document.body.appendChild(div);
    inputMessage.focus();
});

// Manejo del formulario de mensajes
formMessage.addEventListener('submit', (event) => {
    event.preventDefault();
    if(inputMessage.value){
        const message = inputMessage.value.slice(0, 1024);
        addMyMessage(`${myName}: ${message}`);
        socket.emit('message', message);
        inputMessage.value = '';
    }
});

// Detección de escritura
inputMessage.addEventListener('keydown', () => {
    socket.emit('typing', socket.id);
});

/**
 * EVENTOS DE SOCKET.IO
 */
// Eventos de conexión
socket.on('connect', () => {
    connectionStatus.style.display = 'none';
    addSystemMessage('Connected to server');
});

socket.on('disconnect', () => {
    connectionStatus.style.display = 'block';
    addSystemMessage('Disconnected from server');
});

socket.on('reconnect_attempt', (attemptNumber) => {
    addSystemMessage(`Attempting to reconnect... (attempt ${attemptNumber})`);
});

socket.on('reconnect', (attemptNumber) => {
    connectionStatus.style.display = 'none';
    addSystemMessage(`Reconnected to server after ${attemptNumber} attempts`);
    if (myName) socket.emit('name', myName);
});

// Eventos de chat
socket.on('newMessage', ({name, message}) => {
    addMessage(`${name}: ${message}`);
});

socket.on('someoneConnected', (name) => {
    addMessage(`${name} connected.`);
});

socket.on('someoneDisconnect', (name) => {
    addMessage(`${name} disconnected.`);
});

socket.on('someoneTyping', (name) => {
    hourTyping = new Date().getTime();
    setTyping(name);
    setTimeout(() => {
        const currentTime = new Date().getTime();
        if(currentTime - hourTyping > 1000){
            userTyping.remove();
            typing = false;
        }
    }, 2000);
});

// Eventos de actualización de usuarios
socket.on('connectedsUpdate', (usersConnected) => {
    updateOnlineUsers(usersConnected);
});

// Eventos de error
socket.on('reconnect_error', (error) => {
    addErrorMessage(`Reconnection error: ${error.message}`);
});

socket.on('error', (error) => {
    addErrorMessage(`Connection error: ${error.message}`);
});

/**
 * FUNCIONES AUXILIARES
 */
function updateOnlineUsers(usersConnected){
    // Limpiar la lista actual
    onlineList.innerHTML = '';
    
    // Contador de usuarios
    let userCount = 0;
    
    // Actualizar la lista de usuarios
    for(let id in usersConnected){
        if(id !== socket.id){
            const userListItem = document.createElement('li');
            userListItem.innerHTML = usersConnected[id].name;
            onlineList.appendChild(userListItem);
            userCount++;
        }
    }

    // Actualizar el título con el número de usuarios
    p.innerHTML = `Online Users (${userCount})`;
}

function setTyping(name){
    if(typing) userTyping.remove();
    userTyping.innerHTML = `${name} is typing ...`;
    messagesContainer.appendChild(userTyping);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    typing = true;
}

function addSystemMessage(message) {
    const newListItem = document.createElement('li');
    newListItem.classList.add('system-message');
    newListItem.innerHTML = `${new Date().toLocaleTimeString()} System: ${message}`;
    messagesContainer.appendChild(newListItem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addErrorMessage(message) {
    const newListItem = document.createElement('li');
    newListItem.classList.add('error-message');
    newListItem.innerHTML = `${new Date().toLocaleTimeString()} Error: ${message}`;
    messagesContainer.appendChild(newListItem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessage(message){
    const newListItem = document.createElement('li');
    newListItem.innerHTML = `${new Date().toLocaleTimeString()} ${message}`;
    messagesContainer.appendChild(newListItem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    userTyping.remove();
}

function addMyMessage(message){
    const newListItem = document.createElement('li');
    newListItem.classList.add('myMessage');
    newListItem.innerHTML = `${new Date().toLocaleTimeString()} ${message}`;
    messagesContainer.appendChild(newListItem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    userTyping.remove();
}