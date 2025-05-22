"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProtocol = void 0;
const types_1 = require("../types");
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
class BaseProtocol {
    constructor(config = {}) {
        this.agents = new Map();
        this.messageQueue = new Map();
        this.config = {
            maxMessageSize: 1024 * 1024, // 1MB por defecto
            timeout: 30000, // 30 segundos por defecto
            retryAttempts: 3,
            encryption: false,
            ...config
        };
    }
    async registerAgent(agent) {
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent with ID ${agent.id} is already registered`);
        }
        this.agents.set(agent.id, agent);
        this.messageQueue.set(agent.id, []);
        logger_1.default.info(`Agent ${agent.id} registered successfully`);
    }
    async unregisterAgent(agentId) {
        if (!this.agents.has(agentId)) {
            throw new Error(`Agent with ID ${agentId} is not registered`);
        }
        this.agents.delete(agentId);
        this.messageQueue.delete(agentId);
        logger_1.default.info(`Agent ${agentId} unregistered successfully`);
    }
    async send(message) {
        if (!this.agents.has(message.senderId)) {
            throw new Error(`Sender agent ${message.senderId} is not registered`);
        }
        if (!this.agents.has(message.receiverId)) {
            throw new Error(`Receiver agent ${message.receiverId} is not registered`);
        }
        const queue = this.messageQueue.get(message.receiverId);
        if (queue) {
            queue.push(message);
            logger_1.default.info(`Message sent from ${message.senderId} to ${message.receiverId}`);
        }
    }
    async receive() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for message'));
            }, this.config.timeout);
            const checkQueue = () => {
                for (const [agentId, queue] of this.messageQueue.entries()) {
                    if (queue.length > 0) {
                        const message = queue.shift();
                        if (message) {
                            clearTimeout(timeout);
                            logger_1.default.info(`Message received by ${agentId}`);
                            resolve(message);
                            return;
                        }
                    }
                }
                setTimeout(checkQueue, 100);
            };
            checkQueue();
        });
    }
    async broadcast(message) {
        const broadcastMessage = {
            ...message,
            type: types_1.MessageType.BROADCAST,
            id: (0, uuid_1.v4)()
        };
        for (const agentId of this.agents.keys()) {
            if (agentId !== message.senderId) {
                await this.send({
                    ...broadcastMessage,
                    receiverId: agentId
                });
            }
        }
        logger_1.default.info(`Broadcast message sent from ${message.senderId}`);
    }
    async updateAgentStatus(agentId, status) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} is not registered`);
        }
        agent.status = status;
        this.agents.set(agentId, agent);
        // Notificar a otros agentes sobre el cambio de estado
        const statusMessage = {
            id: (0, uuid_1.v4)(),
            senderId: agentId,
            receiverId: 'all',
            type: types_1.MessageType.STATUS_UPDATE,
            content: { status },
            timestamp: Date.now()
        };
        await this.broadcast(statusMessage);
        logger_1.default.info(`Agent ${agentId} status updated to ${status}`);
    }
    async updateAgentCapabilities(agentId, capabilities) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} is not registered`);
        }
        agent.capabilities = capabilities;
        this.agents.set(agentId, agent);
        // Notificar a otros agentes sobre el cambio de capacidades
        const capabilityMessage = {
            id: (0, uuid_1.v4)(),
            senderId: agentId,
            receiverId: 'all',
            type: types_1.MessageType.CAPABILITY_UPDATE,
            content: { capabilities },
            timestamp: Date.now()
        };
        await this.broadcast(capabilityMessage);
        logger_1.default.info(`Agent ${agentId} capabilities updated`);
    }
    getRegisteredAgents() {
        return Array.from(this.agents.values());
    }
    getAgentCapabilities(agentId) {
        const agent = this.agents.get(agentId);
        return agent ? agent.capabilities : [];
    }
}
exports.BaseProtocol = BaseProtocol;
//# sourceMappingURL=BaseProtocol.js.map