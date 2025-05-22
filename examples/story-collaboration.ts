import { WebSocketTransport } from '../src/transport/WebSocketTransport';
import { Encryption } from '../src/utils/encryption';
import { Authentication } from '../src/utils/auth';
import { Agent, AgentStatus, AgentCapability, MessageType, MessagePriority, Message } from '../src/types';
import { StoryWriterAgent } from '../src/agents/StoryWriterAgent';
import { ContentAnalyzerAgent } from '../src/agents/ContentAnalyzerAgent';
import { config } from 'dotenv';
import logger from '../src/utils/logger';

config();

// Función auxiliar para imprimir mensajes formateados
function logMensaje(emisor: string, receptor: string, tipo: string, contenido: any) {
    logger.info('\n' + '='.repeat(80));
    logger.info(`📨 Mensaje de ${emisor} a ${receptor}`);
    logger.info(`📝 Tipo: ${tipo}`);
    logger.info('📊 Contenido:');
    logger.info(JSON.stringify(contenido, null, 2));
    logger.info('='.repeat(80) + '\n');
}

// Función auxiliar para imprimir estados de agentes
function logEstadoAgente(agente: string, estado: string) {
    logger.info('\n' + '-'.repeat(80));
    logger.info(`🤖 ${agente} - Estado: ${estado}`);
    logger.info('-'.repeat(80) + '\n');
}

async function main() {
    try {
        // Configuración inicial
        const encryption = new Encryption(process.env.ENCRYPTION_KEY || 'encryption-key');
        const auth = new Authentication(process.env.AUTH_KEY || 'auth-key');
        const transport = new WebSocketTransport(0, process.env.ENCRYPTION_KEY || 'encryption-key', process.env.AUTH_KEY || 'auth-key');

        // Iniciar el servidor WebSocket
        await transport.listen();
        logger.info(`Servidor WebSocket iniciado en el puerto ${transport.getPort()}`);

        // Crear agentes
        const escritor = new StoryWriterAgent(
            {
                id: 'escritor-ia',
                name: 'Escritor Creativo',
                capabilities: [AgentCapability.CREATIVE_WRITING],
                status: AgentStatus.OFFLINE,
                metadata: {}
            },
            transport,
            auth
        );

        const analizador = new ContentAnalyzerAgent(
            {
                id: 'analizador-ia',
                name: 'Analizador de Contenido',
                capabilities: [AgentCapability.CONTENT_ANALYSIS],
                status: AgentStatus.OFFLINE,
                metadata: {}
            },
            transport,
            auth
        );

        // Inicializar agentes
        logger.info('Inicializando agentes...');
        await escritor.initialize();
        await analizador.initialize();
        logger.info('Agentes inicializados');

        // Esperar a que los agentes estén listos
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Enviar mensaje de broadcast para iniciar la colaboración
        const mensajeInicio: Message = {
            id: 'inicio-colaboracion',
            senderId: 'sistema',
            receiverId: 'all',
            type: MessageType.BROADCAST,
            content: {
                action: 'crear_historia'
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
            encryption: true
        };

        logger.info('Enviando mensaje de inicio de colaboración...');
        await transport.broadcast(mensajeInicio);

        // Esperar a que se complete la colaboración
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Cerrar conexiones
        await transport.close();
        logger.info('Conexiones cerradas');

    } catch (error) {
        logger.error('Error en la ejecución:', error);
        process.exit(1);
    }
}

main(); 