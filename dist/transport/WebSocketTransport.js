"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketTransport = void 0;
const ws_1 = __importDefault(require("ws"));
const types_1 = require("../types");
const encryption_1 = require("../utils/encryption");
const auth_1 = require("../utils/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const types_2 = require("../types");
class WebSocketTransport {
    constructor(port, encryptionKey, authKey) {
        this.agents = new Map();
        this.agentRegistry = new Map();
        this.port = port;
        this.encryption = new encryption_1.Encryption(encryptionKey);
        this.auth = new auth_1.Authentication(authKey);
        logger_1.default.info('WebSocketTransport inicializado');
    }
    async listen() {
        return new Promise((resolve, reject) => {
            try {
                this.wss = new ws_1.default.Server({ port: this.port }, () => {
                    // Obtener el puerto asignado si se especificó 0
                    const address = this.wss.address();
                    if (address && typeof address === 'object') {
                        this.port = address.port;
                    }
                    logger_1.default.info(`Servidor WebSocket iniciado en el puerto ${this.port}`);
                    resolve();
                });
                this.wss.on('connection', this.handleConnection.bind(this));
                this.wss.on('error', (error) => {
                    logger_1.default.error('Error en el servidor WebSocket:', error);
                    reject(error);
                });
            }
            catch (error) {
                logger_1.default.error('Error al iniciar el servidor WebSocket:', error);
                reject(error);
            }
        });
    }
    handleConnection(ws) {
        logger_1.default.info('Nueva conexión WebSocket establecida');
        ws.on('message', async (data) => {
            try {
                const messageStr = data.toString();
                if (!messageStr) {
                    logger_1.default.warn('Mensaje vacío recibido');
                    return;
                }
                let message;
                try {
                    // Intenta parsear como objeto cifrado
                    const maybeEncrypted = JSON.parse(messageStr);
                    if (maybeEncrypted.iv && maybeEncrypted.encrypted) {
                        message = this.encryption.decrypt(messageStr);
                    }
                    else {
                        message = maybeEncrypted;
                    }
                }
                catch (error) {
                    logger_1.default.error('Error al procesar mensaje:', error);
                    return;
                }
                if (message.type === types_1.MessageType.REGISTER) {
                    this.handleRegistration(ws, message);
                }
                else {
                    this.handleMessage(ws, message);
                }
            }
            catch (error) {
                logger_1.default.error('Error al procesar mensaje:', error);
            }
        });
        ws.on('close', () => {
            this.handleDisconnection(ws);
        });
    }
    handleRegistration(ws, message) {
        const agentId = message.senderId;
        const agent = message.content.agent;
        this.agents.set(agentId, ws);
        this.agentRegistry.set(agentId, agent);
        logger_1.default.info(`Agente ${agentId} registrado exitosamente`);
        // Enviar confirmación de registro con el ID asignado
        const response = {
            id: 'register-confirmation',
            senderId: 'server',
            receiverId: agentId,
            type: types_1.MessageType.COLLABORATION_RESPONSE,
            content: {
                action: 'registration_confirmed',
                status: 'success',
                agentId: agentId
            },
            timestamp: Date.now(),
            priority: types_2.MessagePriority.HIGH,
            encryption: true
        };
        this.sendToAgent(agentId, response);
    }
    handleMessage(ws, message) {
        if (message.receiverId === 'all') {
            this.broadcast(message);
        }
        else {
            this.sendToAgent(message.receiverId, message);
        }
    }
    handleDisconnection(ws) {
        for (const [agentId, agentWs] of this.agents.entries()) {
            if (agentWs === ws) {
                this.agents.delete(agentId);
                this.agentRegistry.delete(agentId);
                logger_1.default.info(`Agente ${agentId} desconectado`);
                break;
            }
        }
    }
    async broadcast(message) {
        logger_1.default.info('Enviando mensaje broadcast:', {
            action: message.content.action,
            senderId: message.senderId,
            timestamp: new Date(message.timestamp).toISOString()
        });
        const messageStr = message.encryption ?
            this.encryption.encrypt(message) :
            JSON.stringify(message);
        for (const [agentId, ws] of this.agents.entries()) {
            if (ws.readyState === ws_1.default.OPEN) {
                // Asegurarse de que el receiverId esté establecido para cada agente
                const agentMessage = {
                    ...message,
                    receiverId: agentId
                };
                const agentMessageStr = message.encryption ?
                    this.encryption.encrypt(agentMessage) :
                    JSON.stringify(agentMessage);
                ws.send(agentMessageStr);
                logger_1.default.info(`Mensaje broadcast enviado a ${agentId}`);
            }
        }
    }
    sendToAgent(agentId, message) {
        const ws = this.agents.get(agentId);
        if (ws && ws.readyState === ws_1.default.OPEN) {
            const messageStr = message.encryption ?
                this.encryption.encrypt(message) :
                JSON.stringify(message);
            ws.send(messageStr);
            logger_1.default.info(`Mensaje enviado a ${agentId}:`, {
                type: message.type,
                action: message.content.action
            });
        }
        else {
            logger_1.default.warn(`No se pudo enviar mensaje a ${agentId}: Agente no conectado`);
        }
    }
    async updateAgentStatus(agentId, status) {
        if (!this.agentRegistry.has(agentId)) {
            throw new Error(`Agente con ID ${agentId} no está registrado`);
        }
        const agent = this.agentRegistry.get(agentId);
        if (agent) {
            agent.status = status;
            this.agentRegistry.set(agentId, agent);
        }
        const message = {
            id: 'status-update',
            senderId: 'server',
            receiverId: agentId,
            type: types_1.MessageType.STATUS_UPDATE,
            content: {
                action: 'status_update',
                status: status
            },
            timestamp: Date.now(),
            priority: types_2.MessagePriority.HIGH,
            encryption: true
        };
        this.sendToAgent(agentId, message);
    }
    async updateAgentCapabilities(agentId, capabilities) {
        if (!this.agentRegistry.has(agentId)) {
            throw new Error(`Agente con ID ${agentId} no está registrado`);
        }
        const agent = this.agentRegistry.get(agentId);
        if (agent) {
            agent.capabilities = capabilities;
            this.agentRegistry.set(agentId, agent);
        }
        const message = {
            id: 'capabilities-update',
            senderId: 'server',
            receiverId: agentId,
            type: types_1.MessageType.STATUS_UPDATE,
            content: {
                action: 'capabilities_update',
                capabilities: capabilities
            },
            timestamp: Date.now(),
            priority: types_2.MessagePriority.HIGH,
            encryption: true
        };
        this.sendToAgent(agentId, message);
    }
    getPort() {
        return this.port;
    }
    async registerAgent(agent, token) {
        if (this.agentRegistry.has(agent.id)) {
            throw new Error(`Agente con ID ${agent.id} ya está registrado`);
        }
        const message = {
            id: 'register-agent',
            senderId: agent.id,
            receiverId: 'server',
            type: types_1.MessageType.REGISTER,
            content: {
                action: 'register',
                agent: agent,
                token: token
            },
            timestamp: Date.now(),
            priority: types_2.MessagePriority.HIGH,
            encryption: true
        };
        // Enviar mensaje de registro directamente al servidor
        const ws = this.agents.get(agent.id);
        if (ws) {
            const messageStr = message.encryption ?
                this.encryption.encrypt(message) :
                JSON.stringify(message);
            ws.send(messageStr);
        }
    }
    async close() {
        return new Promise((resolve) => {
            this.wss.close(() => {
                logger_1.default.info('Servidor WebSocket cerrado');
                resolve();
            });
        });
    }
}
exports.WebSocketTransport = WebSocketTransport;
//# sourceMappingURL=WebSocketTransport.js.map