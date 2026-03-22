// index.ts
import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './services/logger.js';
import { setupChatWebsocket } from './services/chat.js';
import { defaultConfig } from './config/index.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initApp = (): { server: HttpServer } => {
    const app = express();
    const publicPath = path.join(__dirname, '..', 'public');
    app.use(express.static(publicPath));

    const server = createServer(app);
    return { server };
};

const startServer = async (): Promise<void> => {
    const { server } = initApp();
    const config = defaultConfig;

    // Inicialitzem el Chat i els Sockets en una sola crida
    setupChatWebsocket(server, config);

    server.on('error', (error: Error) => {
        logger.error({ error: error.message }, 'Server error');
        process.exit(1);
    });

    server.listen(config.port, () => {
        logger.info({ port: config.port, url: `http://localhost:${config.port}` }, 'Server started');
    });
};

startServer().catch(err => {
    logger.error({ err }, 'Failed to start server');
});