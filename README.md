# Real Time Chat

Based on https://github.com/Oosasukel/Real-Time-Chat-Socket.io

## Technologies Used

- **Socket.io**: A JavaScript library for real-time, bidirectional communication between web clients and servers.
- **Node.js**: A JavaScript runtime environment that allows running JavaScript on the server-side.
- **TypeScript**: A free and open-source high-level programming language that adds static typing to JavaScript.
- **Express.js**: A fast and minimalist web application framework for Node.js.
- **HTML/CSS**: The standard markup language and styling for building the user interface.

## State management: simple reducer pattern

The server maintains the chat state using a simple reducer pattern. The state includes connected users and message history. Actions are dispatched to update the state based on user interactions, such as sending messages or changing names.

```
    const createReducer: () => (state: ChatState, action: ChatAction) => ChatState
```
```
    const dispatch = (action: ChatAction) => {
        state = reducer(state, action);
    };
```

## Installation
```
npm install
```

## Execution
```
tsc
node dist/server.js
```

## In the browser
```
http://localhost:3000/
```
