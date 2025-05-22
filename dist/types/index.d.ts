export interface Agent {
    id: string;
    name: string;
    capabilities: AgentCapability[];
    metadata: Record<string, any>;
    status: AgentStatus;
}
export declare enum AgentStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    BUSY = "BUSY",
    IDLE = "IDLE"
}
export declare enum AgentCapability {
    TEXT_PROCESSING = "TEXT_PROCESSING",
    IMAGE_PROCESSING = "IMAGE_PROCESSING",
    DATA_ANALYSIS = "DATA_ANALYSIS",
    DECISION_MAKING = "DECISION_MAKING",
    LEARNING = "LEARNING",
    COLLABORATION = "COLLABORATION",
    TASK_MANAGEMENT = "TASK_MANAGEMENT",
    NATURAL_LANGUAGE_PROCESSING = "NATURAL_LANGUAGE_PROCESSING",
    MACHINE_LEARNING = "MACHINE_LEARNING",
    COMPUTER_VISION = "COMPUTER_VISION",
    SPEECH_RECOGNITION = "SPEECH_RECOGNITION",
    REASONING = "REASONING",
    PLANNING = "PLANNING",
    CREATIVE_WRITING = "CREATIVE_WRITING",
    CONTENT_ANALYSIS = "CONTENT_ANALYSIS"
}
export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    type: MessageType;
    content: any;
    timestamp: number;
    metadata?: Record<string, any>;
    priority?: MessagePriority;
    encryption?: boolean;
}
export declare enum MessageType {
    REGISTER = "register",
    REQUEST = "REQUEST",
    RESPONSE = "RESPONSE",
    BROADCAST = "BROADCAST",
    ERROR = "ERROR",
    STATUS_UPDATE = "STATUS_UPDATE",
    CAPABILITY_UPDATE = "CAPABILITY_UPDATE",
    TASK_ASSIGNMENT = "TASK_ASSIGNMENT",
    TASK_COMPLETION = "TASK_COMPLETION",
    COLLABORATION_REQUEST = "COLLABORATION_REQUEST",
    COLLABORATION_RESPONSE = "COLLABORATION_RESPONSE",
    LEARNING_REQUEST = "LEARNING_REQUEST",
    LEARNING_RESPONSE = "LEARNING_RESPONSE"
}
export declare enum MessagePriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export interface ProtocolConfig {
    maxMessageSize?: number;
    timeout?: number;
    retryAttempts?: number;
    encryption?: boolean;
    authentication?: boolean;
    logging?: boolean;
    transport?: TransportType;
}
export declare enum TransportType {
    WEBSOCKET = "WEBSOCKET",
    HTTP = "HTTP",
    GRPC = "GRPC"
}
export interface AgentCommunication {
    send(message: Message): Promise<void>;
    receive(): Promise<Message>;
    broadcast(message: Message): Promise<void>;
    registerAgent(agent: Agent): Promise<void>;
    unregisterAgent(agentId: string): Promise<void>;
    updateAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
    updateAgentCapabilities(agentId: string, capabilities: AgentCapability[]): Promise<void>;
}
