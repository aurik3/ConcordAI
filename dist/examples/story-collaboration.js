"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketTransport_1 = require("../src/transport/WebSocketTransport");
const encryption_1 = require("../src/utils/encryption");
const auth_1 = require("../src/utils/auth");
const types_1 = require("../src/types");
const StoryWriterAgent_1 = require("../src/agents/StoryWriterAgent");
const ContentAnalyzerAgent_1 = require("../src/agents/ContentAnalyzerAgent");
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../src/utils/logger"));
(0, dotenv_1.config)();
// Función auxiliar para imprimir mensajes formateados
function logMensaje(emisor, receptor, tipo, contenido) {
    logger_1.default.info('\n' + '='.repeat(80));
    logger_1.default.info(`📨 Mensaje de ${emisor} a ${receptor}`);
    logger_1.default.info(`📝 Tipo: ${tipo}`);
    logger_1.default.info('📊 Contenido:');
    logger_1.default.info(JSON.stringify(contenido, null, 2));
    logger_1.default.info('='.repeat(80) + '\n');
}
// Función auxiliar para imprimir estados de agentes
function logEstadoAgente(agente, estado) {
    logger_1.default.info('\n' + '-'.repeat(80));
    logger_1.default.info(`🤖 ${agente} - Estado: ${estado}`);
    logger_1.default.info('-'.repeat(80) + '\n');
}
async function main() {
    try {
        // Configuración inicial
        const encryption = new encryption_1.Encryption(process.env.ENCRYPTION_KEY || 'encryption-key');
        const auth = new auth_1.Authentication(process.env.AUTH_KEY || 'auth-key');
        const transport = new WebSocketTransport_1.WebSocketTransport(0, process.env.ENCRYPTION_KEY || 'encryption-key', process.env.AUTH_KEY || 'auth-key');
        // Iniciar el servidor WebSocket
        await transport.listen();
        logger_1.default.info(`Servidor WebSocket iniciado en el puerto ${transport.getPort()}`);
        // Crear agentes
        const escritor = new StoryWriterAgent_1.StoryWriterAgent({
            id: 'escritor-ia',
            name: 'Escritor Creativo',
            capabilities: [types_1.AgentCapability.CREATIVE_WRITING],
            status: types_1.AgentStatus.OFFLINE,
            metadata: {}
        }, transport, auth);
        const analizador = new ContentAnalyzerAgent_1.ContentAnalyzerAgent({
            id: 'analizador-ia',
            name: 'Analizador de Contenido',
            capabilities: [types_1.AgentCapability.CONTENT_ANALYSIS],
            status: types_1.AgentStatus.OFFLINE,
            metadata: {}
        }, transport, auth);
        // Inicializar agentes
        logger_1.default.info('Inicializando agentes...');
        await escritor.initialize();
        await analizador.initialize();
        logger_1.default.info('Agentes inicializados');
        // Esperar a que los agentes estén listos
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Enviar mensaje de broadcast para iniciar la colaboración
        const mensajeInicio = {
            id: 'inicio-colaboracion',
            senderId: 'sistema',
            receiverId: 'all',
            type: types_1.MessageType.BROADCAST,
            content: {
                action: 'crear_historia'
            },
            timestamp: Date.now(),
            priority: types_1.MessagePriority.HIGH,
            encryption: true
        };
        logger_1.default.info('Enviando mensaje de inicio de colaboración...');
        await transport.broadcast(mensajeInicio);
        // Esperar a que se complete la colaboración
        await new Promise(resolve => setTimeout(resolve, 30000));
        // Cerrar conexiones
        await transport.close();
        logger_1.default.info('Conexiones cerradas');
    }
    catch (error) {
        logger_1.default.error('Error en la ejecución:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=story-collaboration.js.map