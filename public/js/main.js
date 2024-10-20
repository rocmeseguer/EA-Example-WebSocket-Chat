const socket = io();


const formMessage = document.createElement('form');
formMessage.id = "formMessage";

const inputMessage = document.createElement('input');
inputMessage.maxLength = 1024;
inputMessage.id = 'm';
inputMessage.autocomplete = 'off';

const buttonSend = document.createElement('button');
buttonSend.innerHTML = 'Send';

formMessage.appendChild(inputMessage);
formMessage.appendChild(buttonSend);


const formName = document.createElement('form');
formName.id = 'formName';

const inputName = document.createElement('input');
inputName.maxLength = 32;
inputName.autocomplete = 'off';
inputName.placeholder = 'Name';

const buttonName = document.createElement('button');
buttonName.innerHTML = 'Ok';

formName.appendChild(inputName);
formName.appendChild(buttonName);

document.body.appendChild(formName);
inputName.focus();

const messagesContainer = document.createElement('ul');
messagesContainer.id = 'messages';

const div = document.createElement('div');
div.classList.add('messagesContainer');

const onlineDiv = document.createElement('div');
const p = document.createElement('p');
p.innerHTML = 'Online Users';
onlineDiv.appendChild(p);
onlineDiv.classList.add('online');
const onlineList = document.createElement('ul');
onlineDiv.appendChild(onlineList);

function updateOnlineUsers(usersConnected){
    onlineList.innerHTML = '';

    for(let id in usersConnected){
        if(id != socket.id){
            const userListItem = document.createElement('li');
            userListItem.innerHTML = usersConnected[id].name;
            onlineList.appendChild(userListItem);
        }
    }
}

div.appendChild(messagesContainer);
div.appendChild(formMessage);
div.appendChild(onlineDiv);

let myName = '';

inputMessage.addEventListener('keydown', () => {
    socket.emit('typing', socket.id);
});

formName.addEventListener('submit', (event) => {
    event.preventDefault();

    myName = inputName.value ? inputName.value : 'Eu';
    if(inputName.value.length > 32){
        socket.emit('name', inputName.value.slice(0, 32));
    }
    else{
        socket.emit('name', inputName.value);
    }

    formName.remove();
    document.body.appendChild(div);
    inputMessage.focus();
});


formMessage.addEventListener('submit', (event) => {
    event.preventDefault();

    if(inputMessage.value){
        let message = inputMessage.value;
        if(inputMessage.value.length > 1024){
            message = inputMessage.value.slice(0, 1024);
        }

        addMyMessage(`${myName}: ${message}`);
        
        socket.emit('message', message);
    
        inputMessage.value = '';
    }
});

socket.on('newMessage', ({name, message}) => {
    addMessage(`${name}: ${message}`);
});

socket.on('someoneConnected', (name) => {
    addMessage(`${name} conectou.`);
})

socket.on('someoneDisconnect', (name) => {
    addMessage(`${name} desconectou.`);
});

socket.on('connectedsUpdate', (usersConnected) => {
    updateOnlineUsers(usersConnected);
});

const userTyping = document.createElement('li');
let hourTyping = new Date().getTime();
let typing = false;

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
})

function setTyping(name){
    if(typing){
        userTyping.remove();
    }

    userTyping.innerHTML = `${name} is typing ...`;
    
    messagesContainer.appendChild(userTyping);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    typing = true;
}

function addMessage(message){
    const newListItem = document.createElement('li');
    newListItem.innerHTML = `${new Date().toLocaleTimeString()} ${message}`;;

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