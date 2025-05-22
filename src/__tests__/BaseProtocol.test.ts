import { BaseProtocol } from '../protocol/BaseProtocol';
import { Agent, Message, MessageType, AgentStatus, AgentCapability } from '../types';

describe('BaseProtocol', () => {
  let protocol: BaseProtocol;
  let testAgent: Agent;

  beforeEach(() => {
    protocol = new BaseProtocol();
    testAgent = {
      id: 'test-agent',
      name: 'Test Agent',
      capabilities: [AgentCapability.TEXT_PROCESSING],
      metadata: { version: '1.0' },
      status: AgentStatus.ONLINE
    };
  });

  describe('Agent Registration', () => {
    it('should register an agent successfully', async () => {
      await expect(protocol.registerAgent(testAgent)).resolves.not.toThrow();
      const agents = protocol.getRegisteredAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0].id).toBe(testAgent.id);
    });

    it('should not register an agent with duplicate ID', async () => {
      await protocol.registerAgent(testAgent);
      await expect(protocol.registerAgent(testAgent)).rejects.toThrow();
    });
  });

  describe('Message Handling', () => {
    let senderAgent: Agent;
    let receiverAgent: Agent;

    beforeEach(async () => {
      senderAgent = {
        id: 'sender',
        name: 'Sender Agent',
        capabilities: [AgentCapability.TEXT_PROCESSING],
        metadata: {},
        status: AgentStatus.ONLINE
      };

      receiverAgent = {
        id: 'receiver',
        name: 'Receiver Agent',
        capabilities: [AgentCapability.TEXT_PROCESSING],
        metadata: {},
        status: AgentStatus.ONLINE
      };

      await protocol.registerAgent(senderAgent);
      await protocol.registerAgent(receiverAgent);
    });

    it('should send and receive messages', async () => {
      const message: Message = {
        id: 'test-message',
        senderId: senderAgent.id,
        receiverId: receiverAgent.id,
        type: MessageType.REQUEST,
        content: { test: 'data' },
        timestamp: Date.now()
      };

      await protocol.send(message);
      const receivedMessage = await protocol.receive();
      expect(receivedMessage).toEqual(message);
    });

    it('should handle broadcast messages', async () => {
      const message: Message = {
        id: 'broadcast-message',
        senderId: senderAgent.id,
        receiverId: receiverAgent.id,
        type: MessageType.BROADCAST,
        content: { broadcast: 'data' },
        timestamp: Date.now()
      };

      await protocol.broadcast(message);
      const receivedMessage = await protocol.receive();
      expect(receivedMessage.type).toBe(MessageType.BROADCAST);
    });
  });

  describe('Agent Status Updates', () => {
    it('should update agent status', async () => {
      await protocol.registerAgent(testAgent);
      await protocol.updateAgentStatus(testAgent.id, AgentStatus.BUSY);
      const agents = protocol.getRegisteredAgents();
      expect(agents[0].status).toBe(AgentStatus.BUSY);
    });
  });

  describe('Agent Capabilities', () => {
    it('should update agent capabilities', async () => {
      await protocol.registerAgent(testAgent);
      const newCapabilities = [AgentCapability.TEXT_PROCESSING, AgentCapability.DATA_ANALYSIS];
      await protocol.updateAgentCapabilities(testAgent.id, newCapabilities);
      const capabilities = protocol.getAgentCapabilities(testAgent.id);
      expect(capabilities).toEqual(newCapabilities);
    });
  });
}); 