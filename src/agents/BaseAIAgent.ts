import { Agent, Message, MessageType, AgentStatus, MessagePriority } from '../types';
import { WebSocketTransport } from '../transport/WebSocketTransport';
import { Authentication } from '../utils/auth';
import logger from '../utils/logger';
import WebSocket from 'ws';

export abstract class BaseAIAgent {
    protected agent: Agent;
    protected transport: WebSocketTransport;
    protected auth: Authentication;
    protected token: string;
    protected ws: WebSocket | null = null;

    constructor(
        agent: Agent,
        transport: WebSocketTransport,
        auth: Authentication
    ) {
        this.agent = agent;
        this.transport = transport;
        this.auth = auth;
        this.token = auth.generateToken(agent);
        logger.info(`${this.agent.name} - Constructor inicializado`);
    }

    public async initialize(): Promise<void> {
        logger.info(`${this.agent.name} - Iniciando registro`);
        
        return new Promise((resolve, reject) => {
            try {
                const port = this.transport.getPort();
                if (!port) {
                    throw new Error('Puerto del servidor WebSocket no disponible');
                }

                this.ws = new WebSocket(`ws://localhost:${port}`);
                
                this.ws.on('open', () => {
                    logger.info(`${this.agent.name} - Conexión WebSocket establecida`);
                    this.register().then(resolve).catch(reject);
                });

                this.ws.on('message', async (data: WebSocket.Data) => {
                    try {
                        const messageStr = data.toString();
                        if (!messageStr) {
                            logger.warn(`${this.agent.name} - Mensaje vacío recibido`);
                            return;
                        }

                        let message: Message;
                        try {
                            const maybeEncrypted = JSON.parse(messageStr);
                            if (maybeEncrypted.iv && maybeEncrypted.encrypted) {
                                message = this.transport['encryption'].decrypt(messageStr);
                            } else {
                                message = maybeEncrypted;
                            }
                        } catch (error) {
                            logger.error(`${this.agent.name} - Error al descifrar mensaje:`, error);
                            return;
                        }

                        logger.info(`${this.agent.name} - Mensaje recibido:`, {
                            type: message.type,
                            senderId: message.senderId,
                            action: message.content?.action
                        });
                        await this.handleMessage(message);
                    } catch (error) {
                        logger.error(`${this.agent.name} - Error al procesar mensaje:`, error);
                    }
                });

                this.ws.on('error', (error) => {
                    logger.error(`${this.agent.name} - Error en WebSocket:`, error);
                    reject(error);
                });

                this.ws.on('close', () => {
                    logger.info(`${this.agent.name} - Conexión WebSocket cerrada`);
                });

            } catch (error) {
                logger.error(`${this.agent.name} - Error al inicializar:`, error);
                reject(error);
            }
        });
    }

    private async register(): Promise<void> {
        const message: Message = {
            id: 'register',
            senderId: this.agent.id,
            receiverId: 'server',
            type: MessageType.REGISTER,
            content: {
                agent: this.agent,
                token: this.token
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
            encryption: true
        };

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            logger.info(`${this.agent.name} - Mensaje de registro enviado`);
        } else {
            throw new Error('WebSocket no está abierto para enviar el registro');
        }
    }

    public async handleMessage(message: Message): Promise<void> {
        logger.info(`${this.agent.name} - Procesando mensaje:`, {
            type: message.type,
            senderId: message.senderId,
            action: message.content?.action,
            receiverId: message.receiverId,
            myId: this.agent.id
        });

        if (message.receiverId !== this.agent.id && message.receiverId !== 'all') {
            logger.warn(`${this.agent.name} - Mensaje ignorado (receiverId no coincide)`, {
                receiverId: message.receiverId,
                myId: this.agent.id,
                iguales: message.receiverId === this.agent.id,
                rawMessage: message
            });
            return;
        }

        try {
            switch (message.type) {
                case MessageType.COLLABORATION_REQUEST:
                    logger.info(`${this.agent.name} - Procesando COLLABORATION_REQUEST`);
                    await this.handleCollaborationRequest(message);
                    break;
                case MessageType.TASK_COMPLETION:
                    logger.info(`${this.agent.name} - Procesando TASK_COMPLETION`);
                    await this.handleTaskCompletion(message);
                    break;
                case MessageType.BROADCAST:
                    logger.info(`${this.agent.name} - Procesando BROADCAST`);
                    await this.handleBroadcast(message);
                    break;
                case MessageType.COLLABORATION_RESPONSE:
                    logger.info(`${this.agent.name} - Procesando COLLABORATION_RESPONSE`);
                    break;
                default:
                    logger.info(`${this.agent.name} - Tipo de mensaje no manejado: ${message.type}`);
            }
        } catch (error) {
            logger.error(`${this.agent.name} - Error al procesar mensaje:`, error);
        }
    }

    protected abstract handleCollaborationRequest(message: Message): Promise<void>;
    protected abstract handleTaskCompletion(message: Message): Promise<void>;
    protected abstract handleBroadcast(message: Message): Promise<void>;

    protected async sendMessage(message: Message): Promise<void> {
        logger.info(`${this.agent.name} - Enviando mensaje:`, {
            type: message.type,
            receiverId: message.receiverId,
            action: message.content?.action
        });

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            logger.info(`${this.agent.name} - Mensaje enviado exitosamente`);
        } else {
            logger.error(`${this.agent.name} - No se pudo enviar el mensaje: WebSocket no está abierto`);
        }
    }

    protected async updateStatus(status: AgentStatus): Promise<void> {
        logger.info(`${this.agent.name} - Actualizando estado a: ${status}`);
        await this.transport.updateAgentStatus(this.agent.id, status);
    }

    public async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
} 