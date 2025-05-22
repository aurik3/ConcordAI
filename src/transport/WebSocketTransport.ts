import WebSocket from 'ws';
import { Message, MessageType, AgentStatus, Agent } from '../types';
import { Encryption } from '../utils/encryption';
import { Authentication } from '../utils/auth';
import logger from '../utils/logger';
import { MessagePriority } from '../types';

export class WebSocketTransport {
    private wss!: WebSocket.Server;
    private port: number;
    private encryption: Encryption;
    private auth: Authentication;
    private agents: Map<string, WebSocket> = new Map();
    private agentRegistry: Map<string, Agent> = new Map();

    constructor(port: number, encryptionKey: string, authKey: string) {
        this.port = port;
        this.encryption = new Encryption(encryptionKey);
        this.auth = new Authentication(authKey);
        logger.info('WebSocketTransport inicializado');
    }

    public async listen(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.wss = new WebSocket.Server({ port: this.port }, () => {
                    // Obtener el puerto asignado si se especificó 0
                    const address = this.wss.address();
                    if (address && typeof address === 'object') {
                        this.port = address.port;
                    }
                    logger.info(`Servidor WebSocket iniciado en el puerto ${this.port}`);
                    resolve();
                });

                this.wss.on('connection', this.handleConnection.bind(this));
                this.wss.on('error', (error) => {
                    logger.error('Error en el servidor WebSocket:', error);
                    reject(error);
                });
            } catch (error) {
                logger.error('Error al iniciar el servidor WebSocket:', error);
                reject(error);
            }
        });
    }

    private handleConnection(ws: WebSocket): void {
        logger.info('Nueva conexión WebSocket establecida');

        ws.on('message', async (data: WebSocket.Data) => {
            try {
                const messageStr = data.toString();
                if (!messageStr) {
                    logger.warn('Mensaje vacío recibido');
                    return;
                }

                let message: Message;
                try {
                    // Intenta parsear como objeto cifrado
                    const maybeEncrypted = JSON.parse(messageStr);
                    if (maybeEncrypted.iv && maybeEncrypted.encrypted) {
                        message = this.encryption.decrypt(messageStr);
                    } else {
                        message = maybeEncrypted;
                    }
                } catch (error) {
                    logger.error('Error al procesar mensaje:', error);
                    return;
                }

                if (message.type === MessageType.REGISTER) {
                    this.handleRegistration(ws, message);
                } else {
                    this.handleMessage(ws, message);
                }
            } catch (error) {
                logger.error('Error al procesar mensaje:', error);
            }
        });

        ws.on('close', () => {
            this.handleDisconnection(ws);
        });
    }

    private handleRegistration(ws: WebSocket, message: Message): void {
        const agentId = message.senderId;
        const agent = message.content.agent as Agent;
        
        this.agents.set(agentId, ws);
        this.agentRegistry.set(agentId, agent);
        
        logger.info(`Agente ${agentId} registrado exitosamente`);
        
        // Enviar confirmación de registro con el ID asignado
        const response: Message = {
            id: 'register-confirmation',
            senderId: 'server',
            receiverId: agentId,
            type: MessageType.COLLABORATION_RESPONSE,
            content: {
                action: 'registration_confirmed',
                status: 'success',
                agentId: agentId
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
            encryption: true
        };

        this.sendToAgent(agentId, response);
    }

    private handleMessage(ws: WebSocket, message: Message): void {
        if (message.receiverId === 'all') {
            this.broadcast(message);
        } else {
            this.sendToAgent(message.receiverId, message);
        }
    }

    private handleDisconnection(ws: WebSocket): void {
        for (const [agentId, agentWs] of this.agents.entries()) {
            if (agentWs === ws) {
                this.agents.delete(agentId);
                this.agentRegistry.delete(agentId);
                logger.info(`Agente ${agentId} desconectado`);
                break;
            }
        }
    }

    public async broadcast(message: Message): Promise<void> {
        logger.info('Enviando mensaje broadcast:', {
            action: message.content.action,
            senderId: message.senderId,
            timestamp: new Date(message.timestamp).toISOString()
        });

        const messageStr = message.encryption ? 
            this.encryption.encrypt(message) : 
            JSON.stringify(message);

        for (const [agentId, ws] of this.agents.entries()) {
            if (ws.readyState === WebSocket.OPEN) {
                // Asegurarse de que el receiverId esté establecido para cada agente
                const agentMessage = {
                    ...message,
                    receiverId: agentId
                };
                const agentMessageStr = message.encryption ? 
                    this.encryption.encrypt(agentMessage) : 
                    JSON.stringify(agentMessage);
                ws.send(agentMessageStr);
                logger.info(`Mensaje broadcast enviado a ${agentId}`);
            }
        }
    }

    private sendToAgent(agentId: string, message: Message): void {
        const ws = this.agents.get(agentId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            const messageStr = message.encryption ? 
                this.encryption.encrypt(message) : 
                JSON.stringify(message);
            ws.send(messageStr);
            logger.info(`Mensaje enviado a ${agentId}:`, {
                type: message.type,
                action: message.content.action
            });
        } else {
            logger.warn(`No se pudo enviar mensaje a ${agentId}: Agente no conectado`);
        }
    }

    public async updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
        if (!this.agentRegistry.has(agentId)) {
            throw new Error(`Agente con ID ${agentId} no está registrado`);
        }

        const agent = this.agentRegistry.get(agentId);
        if (agent) {
            agent.status = status;
            this.agentRegistry.set(agentId, agent);
        }

        const message: Message = {
            id: 'status-update',
            senderId: 'server',
            receiverId: agentId,
            type: MessageType.STATUS_UPDATE,
            content: {
                action: 'status_update',
                status: status
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
            encryption: true
        };

        this.sendToAgent(agentId, message);
    }

    public async updateAgentCapabilities(agentId: string, capabilities: any[]): Promise<void> {
        if (!this.agentRegistry.has(agentId)) {
            throw new Error(`Agente con ID ${agentId} no está registrado`);
        }

        const agent = this.agentRegistry.get(agentId);
        if (agent) {
            agent.capabilities = capabilities;
            this.agentRegistry.set(agentId, agent);
        }

        const message: Message = {
            id: 'capabilities-update',
            senderId: 'server',
            receiverId: agentId,
            type: MessageType.STATUS_UPDATE,
            content: {
                action: 'capabilities_update',
                capabilities: capabilities
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
            encryption: true
        };

        this.sendToAgent(agentId, message);
    }

    public getPort(): number {
        return this.port;
    }

    public async registerAgent(agent: Agent, token: string): Promise<void> {
        if (this.agentRegistry.has(agent.id)) {
            throw new Error(`Agente con ID ${agent.id} ya está registrado`);
        }

        const message: Message = {
            id: 'register-agent',
            senderId: agent.id,
            receiverId: 'server',
            type: MessageType.REGISTER,
            content: {
                action: 'register',
                agent: agent,
                token: token
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
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

    public async close(): Promise<void> {
        return new Promise((resolve) => {
            this.wss.close(() => {
                logger.info('Servidor WebSocket cerrado');
                resolve();
            });
        });
    }
} 