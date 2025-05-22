import { BaseProtocol, Agent, MessageType, AgentStatus, AgentCapability, Message, MessagePriority } from '../src';
import { WebSocketTransport } from '../src/transport/WebSocketTransport';
import { Encryption } from '../src/utils/encryption';
import { Authentication } from '../src/utils/auth';

async function main() {
  // Configuración inicial
  const encryption = new Encryption('mi-clave-secreta-123');
  const auth = new Authentication('mi-clave-auth-456');
  const transport = new WebSocketTransport(0, 'mi-clave-encryption-789', 'mi-clave-auth-456');
  
  console.log(`Servidor WebSocket iniciado en el puerto ${transport.getPort()}`);

  // Crear dos agentes de ejemplo
  const agente1: Agent = {
    id: 'agente1',
    name: 'Agente Procesador',
    capabilities: [AgentCapability.TEXT_PROCESSING, AgentCapability.DATA_ANALYSIS],
    metadata: { version: '1.0' },
    status: AgentStatus.ONLINE
  };

  const agente2: Agent = {
    id: 'agente2',
    name: 'Agente Analista',
    capabilities: [AgentCapability.DATA_ANALYSIS, AgentCapability.DECISION_MAKING],
    metadata: { version: '1.0' },
    status: AgentStatus.ONLINE
  };

  try {
    // Registrar los agentes
    console.log('Registrando agentes...');
    const token1 = auth.generateToken(agente1);
    const token2 = auth.generateToken(agente2);
    
    await transport.registerAgent(agente1, token1);
    await transport.registerAgent(agente2, token2);

    // Esperar un momento para asegurar que los agentes están registrados
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actualizar estado del agente1 a BUSY
    console.log('Actualizando estado del agente1...');
    await transport.updateAgentStatus(agente1.id, AgentStatus.BUSY);

    // Actualizar capacidades del agente2
    console.log('Actualizando capacidades del agente2...');
    const nuevasCapacidades = [
      AgentCapability.DATA_ANALYSIS,
      AgentCapability.DECISION_MAKING,
      AgentCapability.COLLABORATION
    ];
    await transport.updateAgentCapabilities(agente2.id, nuevasCapacidades);

    // Enviar un mensaje de agente1 a agente2
    console.log('Enviando mensaje...');
    const mensaje: Message = {
      id: 'msg1',
      senderId: agente1.id,
      receiverId: agente2.id,
      type: MessageType.REQUEST,
      content: {
        action: 'analizar',
        data: 'Datos para análisis'
      },
      timestamp: Date.now(),
      priority: MessagePriority.HIGH,
      encryption: true
    };

    // Enviar un mensaje de broadcast
    console.log('Enviando mensaje broadcast...');
    const mensajeBroadcast: Message = {
      id: 'broadcast1',
      senderId: agente1.id,
      receiverId: 'all',
      type: MessageType.BROADCAST,
      content: {
        action: 'notificar',
        data: 'Mensaje para todos los agentes'
      },
      timestamp: Date.now(),
      priority: MessagePriority.MEDIUM,
      encryption: true
    };

    await transport.broadcast(mensajeBroadcast);

    // Esperar un momento para ver los mensajes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Actualizar estado del agente1 de vuelta a ONLINE
    console.log('Actualizando estado del agente1 a ONLINE...');
    await transport.updateAgentStatus(agente1.id, AgentStatus.ONLINE);

    // Cerrar la conexión
    transport.close();
    console.log('Prueba completada');

  } catch (error) {
    console.error('Error durante la prueba:', error);
  }
}

main().catch(console.error); 