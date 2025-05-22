import { Message } from '../types';
import { BaseAIAgent } from './BaseAIAgent';
export declare class ContentAnalyzerAgent extends BaseAIAgent {
    private openai;
    constructor(agent: any, transport: any, auth: any);
    protected handleCollaborationRequest(message: Message): Promise<void>;
    protected handleTaskCompletion(message: Message): Promise<void>;
    protected handleBroadcast(message: Message): Promise<void>;
}
