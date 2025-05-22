import { Agent, Message, MessageType, ProtocolConfig, AgentCommunication, AgentStatus, AgentCapability } from '../types';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export class BaseProtocol implements AgentCommunication {
  private agents: Map<string, Agent>;
  private messageQueue: Map<string, Message[]>;
  private config: ProtocolConfig;

  constructor(config: ProtocolConfig = {}) {
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

  async registerAgent(agent: Agent): Promise<void> {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent with ID ${agent.id} is already registered`);
    }
    this.agents.set(agent.id, agent);
    this.messageQueue.set(agent.id, []);
    logger.info(`Agent ${agent.id} registered successfully`);
  }

  async unregisterAgent(agentId: string): Promise<void> {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent with ID ${agentId} is not registered`);
    }
    this.agents.delete(agentId);
    this.messageQueue.delete(agentId);
    logger.info(`Agent ${agentId} unregistered successfully`);
  }

  async send(message: Message): Promise<void> {
    if (!this.agents.has(message.senderId)) {
      throw new Error(`Sender agent ${message.senderId} is not registered`);
    }
    if (!this.agents.has(message.receiverId)) {
      throw new Error(`Receiver agent ${message.receiverId} is not registered`);
    }

    const queue = this.messageQueue.get(message.receiverId);
    if (queue) {
      queue.push(message);
      logger.info(`Message sent from ${message.senderId} to ${message.receiverId}`);
    }
  }

  async receive(): Promise<Message> {
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
              logger.info(`Message received by ${agentId}`);
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

  async broadcast(message: Message): Promise<void> {
    const broadcastMessage: Message = {
      ...message,
      type: MessageType.BROADCAST,
      id: uuidv4()
    };

    for (const agentId of this.agents.keys()) {
      if (agentId !== message.senderId) {
        await this.send({
          ...broadcastMessage,
          receiverId: agentId
        });
      }
    }
    logger.info(`Broadcast message sent from ${message.senderId}`);
  }

  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} is not registered`);
    }
    
    agent.status = status;
    this.agents.set(agentId, agent);
    
    // Notificar a otros agentes sobre el cambio de estado
    const statusMessage: Message = {
      id: uuidv4(),
      senderId: agentId,
      receiverId: 'all',
      type: MessageType.STATUS_UPDATE,
      content: { status },
      timestamp: Date.now()
    };
    
    await this.broadcast(statusMessage);
    logger.info(`Agent ${agentId} status updated to ${status}`);
  }

  async updateAgentCapabilities(agentId: string, capabilities: AgentCapability[]): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} is not registered`);
    }
    
    agent.capabilities = capabilities;
    this.agents.set(agentId, agent);
    
    // Notificar a otros agentes sobre el cambio de capacidades
    const capabilityMessage: Message = {
      id: uuidv4(),
      senderId: agentId,
      receiverId: 'all',
      type: MessageType.CAPABILITY_UPDATE,
      content: { capabilities },
      timestamp: Date.now()
    };
    
    await this.broadcast(capabilityMessage);
    logger.info(`Agent ${agentId} capabilities updated`);
  }

  getRegisteredAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgentCapabilities(agentId: string): AgentCapability[] {
    const agent = this.agents.get(agentId);
    return agent ? agent.capabilities : [];
  }
} 