"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const WebSocketTransport_1 = require("../src/transport/WebSocketTransport");
const encryption_1 = require("../src/utils/encryption");
const auth_1 = require("../src/utils/auth");
async function main() {
    // Configuración inicial
    const encryption = new encryption_1.Encryption('mi-clave-secreta-123');
    const auth = new auth_1.Authentication('mi-clave-auth-456');
    const transport = new WebSocketTransport_1.WebSocketTransport(0, 'mi-clave-encryption-789', 'mi-clave-auth-456');
    console.log(`Servidor WebSocket iniciado en el puerto ${transport.getPort()}`);
    // Crear dos agentes de ejemplo
    const agente1 = {
        id: 'agente1',
        name: 'Agente Procesador',
        capabilities: [src_1.AgentCapability.TEXT_PROCESSING, src_1.AgentCapability.DATA_ANALYSIS],
        metadata: { version: '1.0' },
        status: src_1.AgentStatus.ONLINE
    };
    const agente2 = {
        id: 'agente2',
        name: 'Agente Analista',
        capabilities: [src_1.AgentCapability.DATA_ANALYSIS, src_1.AgentCapability.DECISION_MAKING],
        metadata: { version: '1.0' },
        status: src_1.AgentStatus.ONLINE
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
        await transport.updateAgentStatus(agente1.id, src_1.AgentStatus.BUSY);
        // Actualizar capacidades del agente2
        console.log('Actualizando capacidades del agente2...');
        const nuevasCapacidades = [
            src_1.AgentCapability.DATA_ANALYSIS,
            src_1.AgentCapability.DECISION_MAKING,
            src_1.AgentCapability.COLLABORATION
        ];
        await transport.updateAgentCapabilities(agente2.id, nuevasCapacidades);
        // Enviar un mensaje de agente1 a agente2
        console.log('Enviando mensaje...');
        const mensaje = {
            id: 'msg1',
            senderId: agente1.id,
            receiverId: agente2.id,
            type: src_1.MessageType.REQUEST,
            content: {
                action: 'analizar',
                data: 'Datos para análisis'
            },
            timestamp: Date.now(),
            priority: src_1.MessagePriority.HIGH,
            encryption: true
        };
        // Enviar un mensaje de broadcast
        console.log('Enviando mensaje broadcast...');
        const mensajeBroadcast = {
            id: 'broadcast1',
            senderId: agente1.id,
            receiverId: 'all',
            type: src_1.MessageType.BROADCAST,
            content: {
                action: 'notificar',
                data: 'Mensaje para todos los agentes'
            },
            timestamp: Date.now(),
            priority: src_1.MessagePriority.MEDIUM,
            encryption: true
        };
        await transport.broadcast(mensajeBroadcast);
        // Esperar un momento para ver los mensajes
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Actualizar estado del agente1 de vuelta a ONLINE
        console.log('Actualizando estado del agente1 a ONLINE...');
        await transport.updateAgentStatus(agente1.id, src_1.AgentStatus.ONLINE);
        // Cerrar la conexión
        transport.close();
        console.log('Prueba completada');
    }
    catch (error) {
        console.error('Error durante la prueba:', error);
    }
}
main().catch(console.error);
//# sourceMappingURL=basic-usage.js.map