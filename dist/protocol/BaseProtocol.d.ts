import { Agent, Message, ProtocolConfig, AgentCommunication, AgentStatus, AgentCapability } from '../types';
export declare class BaseProtocol implements AgentCommunication {
    private agents;
    private messageQueue;
    private config;
    constructor(config?: ProtocolConfig);
    registerAgent(agent: Agent): Promise<void>;
    unregisterAgent(agentId: string): Promise<void>;
    send(message: Message): Promise<void>;
    receive(): Promise<Message>;
    broadcast(message: Message): Promise<void>;
    updateAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
    updateAgentCapabilities(agentId: string, capabilities: AgentCapability[]): Promise<void>;
    getRegisteredAgents(): Agent[];
    getAgentCapabilities(agentId: string): AgentCapability[];
}
