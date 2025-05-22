import { Agent, Message, AgentStatus } from '../types';
import { WebSocketTransport } from '../transport/WebSocketTransport';
import { Authentication } from '../utils/auth';
import WebSocket from 'ws';
export declare abstract class BaseAIAgent {
    protected agent: Agent;
    protected transport: WebSocketTransport;
    protected auth: Authentication;
    protected token: string;
    protected ws: WebSocket | null;
    constructor(agent: Agent, transport: WebSocketTransport, auth: Authentication);
    initialize(): Promise<void>;
    private register;
    handleMessage(message: Message): Promise<void>;
    protected abstract handleCollaborationRequest(message: Message): Promise<void>;
    protected abstract handleTaskCompletion(message: Message): Promise<void>;
    protected abstract handleBroadcast(message: Message): Promise<void>;
    protected sendMessage(message: Message): Promise<void>;
    protected updateStatus(status: AgentStatus): Promise<void>;
}
