import { Message, AgentStatus, Agent } from '../types';
export declare class WebSocketTransport {
    private wss;
    private port;
    private encryption;
    private auth;
    private agents;
    private agentRegistry;
    constructor(port: number, encryptionKey: string, authKey: string);
    listen(): Promise<void>;
    private handleConnection;
    private handleRegistration;
    private handleMessage;
    private handleDisconnection;
    broadcast(message: Message): Promise<void>;
    private sendToAgent;
    updateAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
    updateAgentCapabilities(agentId: string, capabilities: any[]): Promise<void>;
    getPort(): number;
    registerAgent(agent: Agent, token: string): Promise<void>;
    close(): Promise<void>;
}
