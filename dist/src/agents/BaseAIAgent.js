"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIAgent = void 0;
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
const ws_1 = __importDefault(require("ws"));
class BaseAIAgent {
    constructor(agent, transport, auth) {
        this.ws = null;
        this.agent = agent;
        this.transport = transport;
        this.auth = auth;
        this.token = auth.generateToken(agent);
        logger_1.default.info(`${this.agent.name} - Constructor inicializado`);
    }
    async initialize() {
        logger_1.default.info(`${this.agent.name} - Iniciando registro`);
        return new Promise((resolve, reject) => {
            try {
                const port = this.transport.getPort();
                if (!port) {
                    throw new Error('Puerto del servidor WebSocket no disponible');
                }
                this.ws = new ws_1.default(`ws://localhost:${port}`);
                this.ws.on('open', () => {
                    logger_1.default.info(`${this.agent.name} - Conexión WebSocket establecida`);
                    this.register().then(resolve).catch(reject);
                });
                this.ws.on('message', async (data) => {
                    try {
                        const messageStr = data.toString();
                        if (!messageStr) {
                            logger_1.default.warn(`${this.agent.name} - Mensaje vacío recibido`);
                            return;
                        }
                        let message;
                        try {
                            const maybeEncrypted = JSON.parse(messageStr);
                            if (maybeEncrypted.iv && maybeEncrypted.encrypted) {
                                message = this.transport['encryption'].decrypt(messageStr);
                            }
                            else {
                                message = maybeEncrypted;
                            }
                        }
                        catch (error) {
                            logger_1.default.error(`${this.agent.name} - Error al descifrar mensaje:`, error);
                            return;
                        }
                        logger_1.default.info(`${this.agent.name} - Mensaje recibido:`, {
                            type: message.type,
                            senderId: message.senderId,
                            action: message.content?.action
                        });
                        await this.handleMessage(message);
                    }
                    catch (error) {
                        logger_1.default.error(`${this.agent.name} - Error al procesar mensaje:`, error);
                    }
                });
                this.ws.on('error', (error) => {
                    logger_1.default.error(`${this.agent.name} - Error en WebSocket:`, error);
                    reject(error);
                });
                this.ws.on('close', () => {
                    logger_1.default.info(`${this.agent.name} - Conexión WebSocket cerrada`);
                });
            }
            catch (error) {
                logger_1.default.error(`${this.agent.name} - Error al inicializar:`, error);
                reject(error);
            }
        });
    }
    async register() {
        const message = {
            id: 'register',
            senderId: this.agent.id,
            receiverId: 'server',
            type: types_1.MessageType.REGISTER,
            content: {
                agent: this.agent,
                token: this.token
            },
            timestamp: Date.now(),
            priority: types_1.MessagePriority.HIGH,
            encryption: true
        };
        if (this.ws?.readyState === ws_1.default.OPEN) {
            this.ws.send(JSON.stringify(message));
            logger_1.default.info(`${this.agent.name} - Mensaje de registro enviado`);
        }
        else {
            throw new Error('WebSocket no está abierto para enviar el registro');
        }
    }
    async handleMessage(message) {
        logger_1.default.info(`${this.agent.name} - Procesando mensaje:`, {
            type: message.type,
            senderId: message.senderId,
            action: message.content?.action,
            receiverId: message.receiverId,
            myId: this.agent.id
        });
        if (message.receiverId !== this.agent.id && message.receiverId !== 'all') {
            logger_1.default.warn(`${this.agent.name} - Mensaje ignorado (receiverId no coincide)`, {
                receiverId: message.receiverId,
                myId: this.agent.id,
                iguales: message.receiverId === this.agent.id,
                rawMessage: message
            });
            return;
        }
        try {
            switch (message.type) {
                case types_1.MessageType.COLLABORATION_REQUEST:
                    logger_1.default.info(`${this.agent.name} - Procesando COLLABORATION_REQUEST`);
                    await this.handleCollaborationRequest(message);
                    break;
                case types_1.MessageType.TASK_COMPLETION:
                    logger_1.default.info(`${this.agent.name} - Procesando TASK_COMPLETION`);
                    await this.handleTaskCompletion(message);
                    break;
                case types_1.MessageType.BROADCAST:
                    logger_1.default.info(`${this.agent.name} - Procesando BROADCAST`);
                    await this.handleBroadcast(message);
                    break;
                case types_1.MessageType.COLLABORATION_RESPONSE:
                    logger_1.default.info(`${this.agent.name} - Procesando COLLABORATION_RESPONSE`);
                    break;
                default:
                    logger_1.default.info(`${this.agent.name} - Tipo de mensaje no manejado: ${message.type}`);
            }
        }
        catch (error) {
            logger_1.default.error(`${this.agent.name} - Error al procesar mensaje:`, error);
        }
    }
    async sendMessage(message) {
        logger_1.default.info(`${this.agent.name} - Enviando mensaje:`, {
            type: message.type,
            receiverId: message.receiverId,
            action: message.content?.action
        });
        if (this.ws?.readyState === ws_1.default.OPEN) {
            this.ws.send(JSON.stringify(message));
            logger_1.default.info(`${this.agent.name} - Mensaje enviado exitosamente`);
        }
        else {
            logger_1.default.error(`${this.agent.name} - No se pudo enviar el mensaje: WebSocket no está abierto`);
        }
    }
    async updateStatus(status) {
        logger_1.default.info(`${this.agent.name} - Actualizando estado a: ${status}`);
        await this.transport.updateAgentStatus(this.agent.id, status);
    }
    async disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
exports.BaseAIAgent = BaseAIAgent;
//# sourceMappingURL=BaseAIAgent.js.map