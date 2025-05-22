"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const WebSocketTransport_1 = require("../src/transport/WebSocketTransport");
const encryption_1 = require("../src/utils/encryption");
const auth_1 = require("../src/utils/auth");
// Datos de ejemplo para análisis
const datosAnalisis = [
    { texto: "Me encanta este producto, es excelente!", puntuacion: 5 },
    { texto: "No está mal, pero podría mejorar", puntuacion: 3 },
    { texto: "Pésimo servicio, no lo recomiendo", puntuacion: 1 },
    { texto: "Increíble experiencia de usuario", puntuacion: 5 },
    { texto: "Regular, nada del otro mundo", puntuacion: 2 }
];
// Función auxiliar para imprimir mensajes formateados
function logMensaje(emisor, receptor, tipo, contenido) {
    console.log('\n' + '='.repeat(80));
    console.log(`📨 Mensaje de ${emisor} a ${receptor}`);
    console.log(`📝 Tipo: ${tipo}`);
    console.log('📊 Contenido:');
    console.log(JSON.stringify(contenido, null, 2));
    console.log('='.repeat(80) + '\n');
}
// Función auxiliar para imprimir estados de agentes
function logEstadoAgente(agente, estado) {
    console.log('\n' + '-'.repeat(80));
    console.log(`🤖 ${agente} - Estado: ${estado}`);
    console.log('-'.repeat(80) + '\n');
}
async function main() {
    // Configuración inicial
    const encryption = new encryption_1.Encryption('clave-secreta-ia-123');
    const auth = new auth_1.Authentication('clave-auth-ia-456');
    const transport = new WebSocketTransport_1.WebSocketTransport(0, 'clave-encryption-ia-789', 'clave-auth-ia-456');
    console.log(`\n🚀 Servidor WebSocket iniciado en el puerto ${transport.getPort()}\n`);
    // Crear agentes de IA especializados
    const agenteNLP = {
        id: 'nlp-agent',
        name: 'Agente Procesamiento de Lenguaje Natural',
        capabilities: [
            src_1.AgentCapability.TEXT_PROCESSING,
            src_1.AgentCapability.NATURAL_LANGUAGE_PROCESSING,
            src_1.AgentCapability.COLLABORATION
        ],
        metadata: {
            version: '1.0',
            model: 'GPT-4',
            specializations: ['análisis de sentimientos', 'procesamiento de texto']
        },
        status: src_1.AgentStatus.ONLINE
    };
    const agenteAnalista = {
        id: 'data-analyst',
        name: 'Agente Analista de Datos',
        capabilities: [
            src_1.AgentCapability.DATA_ANALYSIS,
            src_1.AgentCapability.DECISION_MAKING,
            src_1.AgentCapability.COLLABORATION
        ],
        metadata: {
            version: '1.0',
            model: 'Claude',
            specializations: ['análisis estadístico', 'visualización de datos']
        },
        status: src_1.AgentStatus.ONLINE
    };
    try {
        // Registrar los agentes
        console.log('🤝 Registrando agentes de IA...\n');
        const tokenNLP = auth.generateToken(agenteNLP);
        const tokenAnalista = auth.generateToken(agenteAnalista);
        await transport.registerAgent(agenteNLP, tokenNLP);
        console.log(`✅ ${agenteNLP.name} registrado y listo para colaborar`);
        await transport.registerAgent(agenteAnalista, tokenAnalista);
        console.log(`✅ ${agenteAnalista.name} registrado y listo para colaborar\n`);
        // Esperar a que los agentes estén registrados
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Fase 1: Análisis de sentimientos por el agente NLP
        console.log('\n📊 FASE 1: ANÁLISIS DE SENTIMIENTOS');
        console.log('----------------------------------------');
        await transport.updateAgentStatus(agenteNLP.id, src_1.AgentStatus.BUSY);
        logEstadoAgente(agenteNLP.name, 'BUSY');
        const mensajeAnalisis = {
            id: 'analisis-sentimientos',
            senderId: agenteAnalista.id,
            receiverId: agenteNLP.id,
            type: src_1.MessageType.REQUEST,
            content: {
                action: 'analizar_sentimientos',
                data: datosAnalisis,
                task: 'Analizar el sentimiento de cada texto y proporcionar un análisis detallado'
            },
            timestamp: Date.now(),
            priority: src_1.MessagePriority.HIGH,
            encryption: true
        };
        // Simular respuesta del agente NLP
        const respuestaNLP = {
            id: 'respuesta-sentimientos',
            senderId: agenteNLP.id,
            receiverId: agenteAnalista.id,
            type: src_1.MessageType.RESPONSE,
            content: {
                action: 'resultado_analisis',
                data: {
                    analisis: datosAnalisis.map(item => ({
                        texto: item.texto,
                        sentimiento: item.puntuacion >= 4 ? 'positivo' :
                            item.puntuacion <= 2 ? 'negativo' : 'neutral',
                        confianza: 0.85
                    })),
                    resumen: 'Análisis de sentimientos completado con alta confianza'
                }
            },
            timestamp: Date.now(),
            priority: src_1.MessagePriority.HIGH,
            encryption: true
        };
        // Fase 2: Análisis estadístico por el agente analista
        console.log('\n📈 FASE 2: ANÁLISIS ESTADÍSTICO');
        console.log('----------------------------------------');
        await transport.updateAgentStatus(agenteNLP.id, src_1.AgentStatus.ONLINE);
        logEstadoAgente(agenteNLP.name, 'ONLINE');
        await transport.updateAgentStatus(agenteAnalista.id, src_1.AgentStatus.BUSY);
        logEstadoAgente(agenteAnalista.name, 'BUSY');
        const mensajeEstadistico = {
            id: 'analisis-estadistico',
            senderId: agenteAnalista.id,
            receiverId: 'all',
            type: src_1.MessageType.BROADCAST,
            content: {
                action: 'resultado_estadistico',
                data: {
                    total_muestras: datosAnalisis.length,
                    distribucion_sentimientos: {
                        positivo: 2,
                        neutral: 1,
                        negativo: 2
                    },
                    promedio_puntuacion: 3.2,
                    conclusion: 'La mayoría de las opiniones son extremas (muy positivas o muy negativas)'
                }
            },
            timestamp: Date.now(),
            priority: src_1.MessagePriority.MEDIUM,
            encryption: true
        };
        // Simular la secuencia de mensajes
        console.log('\n🔄 SIMULANDO COMUNICACIÓN ENTRE AGENTES');
        console.log('----------------------------------------');
        // Enviar solicitud de análisis
        logMensaje(agenteAnalista.name, agenteNLP.name, 'SOLICITUD DE ANÁLISIS', mensajeAnalisis.content);
        await transport.broadcast(mensajeAnalisis);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Enviar respuesta del análisis
        logMensaje(agenteNLP.name, agenteAnalista.name, 'RESPUESTA DE ANÁLISIS', respuestaNLP.content);
        await transport.broadcast(respuestaNLP);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Enviar análisis estadístico
        logMensaje(agenteAnalista.name, 'TODOS LOS AGENTES', 'ANÁLISIS ESTADÍSTICO', mensajeEstadistico.content);
        await transport.broadcast(mensajeEstadistico);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Actualizar estados finales
        await transport.updateAgentStatus(agenteAnalista.id, src_1.AgentStatus.ONLINE);
        logEstadoAgente(agenteAnalista.name, 'ONLINE');
        console.log('\n✨ RESUMEN DE LA COLABORACIÓN');
        console.log('----------------------------------------');
        console.log('1. El Analista de Datos solicitó un análisis de sentimientos');
        console.log('2. El Agente NLP procesó los textos y clasificó los sentimientos');
        console.log('3. El Analista de Datos procesó los resultados y generó estadísticas');
        console.log('4. Se compartieron los resultados finales con todos los agentes');
        console.log('\n✅ Colaboración completada exitosamente');
        // Cerrar la conexión
        transport.close();
        console.log('\n👋 Conexión cerrada');
    }
    catch (error) {
        console.error('\n❌ Error durante la colaboración:', error);
    }
}
main().catch(console.error);
//# sourceMappingURL=ai-collaboration.js.map