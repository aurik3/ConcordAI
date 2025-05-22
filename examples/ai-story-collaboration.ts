import { BaseProtocol, Agent, MessageType, AgentStatus, AgentCapability, Message, MessagePriority } from '../src';
import { WebSocketTransport } from '../src/transport/WebSocketTransport';
import { Encryption } from '../src/utils/encryption';
import { Authentication } from '../src/utils/auth';
import { StoryWriterAgent } from '../src/agents/StoryWriterAgent';
import { ContentAnalyzerAgent } from '../src/agents/ContentAnalyzerAgent';
import { config } from 'dotenv';

config();

async function main() {
    // Configuración inicial
    const encryption = new Encryption('clave-secreta-ia-123');
    const auth = new Authentication('clave-auth-ia-456');
    const transport = new WebSocketTransport(0, 'clave-encryption-ia-789', 'clave-auth-ia-456');
    
    await transport.listen();

    const port = transport.getPort();
    if (!port || port === 0) {
        throw new Error('El servidor WebSocket no está escuchando en un puerto válido');
    }
    console.log(`\n🚀 Servidor WebSocket iniciado en el puerto ${port}\n`);

    // Crear agentes de IA especializados
    const escritor: Agent = {
        id: 'escritor-ia',
        name: 'Escritor Creativo',
        capabilities: [
            AgentCapability.TEXT_PROCESSING,
            AgentCapability.CREATIVE_WRITING,
            AgentCapability.COLLABORATION
        ],
        metadata: { 
            version: '1.0',
            model: 'GPT-4',
            specializations: ['escritura creativa', 'narrativa']
        },
        status: AgentStatus.ONLINE
    };

    const analizador: Agent = {
        id: 'analizador-ia',
        name: 'Analizador de Contenido',
        capabilities: [
            AgentCapability.CONTENT_ANALYSIS,
            AgentCapability.TEXT_PROCESSING,
            AgentCapability.COLLABORATION
        ],
        metadata: { 
            version: '1.0',
            model: 'GPT-4',
            specializations: ['análisis de contenido', 'evaluación de calidad']
        },
        status: AgentStatus.ONLINE
    };

    let writerAgent: StoryWriterAgent | null = null;
    let analyzerAgent: ContentAnalyzerAgent | null = null;

    // Variables para almacenar el resultado final
    let historiaFinal: string | null = null;
    let analisisFinal: string | null = null;

    // Promesas para esperar los resultados finales
    let resolverHistoria: (() => void) | null = null;
    let resolverAnalisis: (() => void) | null = null;
    const historiaFinalPromise = new Promise<void>(resolve => resolverHistoria = resolve);
    const analisisFinalPromise = new Promise<void>(resolve => resolverAnalisis = resolve);

    // Función para escuchar mensajes y capturar los resultados finales
    function escucharResultados(agent: StoryWriterAgent | ContentAnalyzerAgent) {
        const originalHandleMessage = agent.handleMessage.bind(agent);
        agent.handleMessage = async (message: Message) => {
            if (message.content?.action === 'historia_mejorada' && message.content?.data?.historia) {
                historiaFinal = message.content.data.historia;
                resolverHistoria && resolverHistoria();
            }
            if (message.content?.action === 'analisis_completado' && message.content?.data?.analisis && message.content?.data?.es_version_mejorada) {
                analisisFinal = message.content.data.analisis;
                resolverAnalisis && resolverAnalisis();
            }
            await originalHandleMessage(message);
        };
    }

    try {
        // Inicializar los agentes
        writerAgent = new StoryWriterAgent(escritor, transport, auth);
        analyzerAgent = new ContentAnalyzerAgent(analizador, transport, auth);

        // Escuchar resultados finales
        escucharResultados(writerAgent);
        escucharResultados(analyzerAgent);

        // Registrar los agentes
        await writerAgent.initialize();
        await analyzerAgent.initialize();

        console.log('Agentes registrados y listos para colaborar');

        // Iniciar la colaboración
        const mensajeInicio: Message = {
            id: 'inicio-colaboracion',
            senderId: 'server',
            receiverId: 'all',
            type: MessageType.BROADCAST,
            content: {
                action: 'crear_historia',
                data: {
                    tema: 'aventura en el bosque',
                    valores: ['amistad', 'trabajo en equipo']
                }
            },
            timestamp: Date.now(),
            priority: MessagePriority.HIGH,
            encryption: true
        };

        await transport.broadcast(mensajeInicio);

        // Esperar a que se reciban la historia final y el análisis final
        await Promise.all([historiaFinalPromise, analisisFinalPromise]);

        // Resumen final de la colaboración
        console.log('\n✨ RESUMEN FINAL DE LA COLABORACIÓN');
        console.log('----------------------------------------');
        console.log('1. El Escritor Creativo generó la historia inicial');
        console.log('2. El Analizador de Contenido evaluó la historia y proporcionó sugerencias');
        console.log('3. El Escritor Creativo mejoró la historia basándose en el análisis');
        console.log('4. El Analizador de Contenido verificó las mejoras y finalizó el proceso');
        console.log('\n✅ Colaboración completada exitosamente');

        // Mostrar el resultado final
        if (historiaFinal) {
            console.log('\n📖 Historia final mejorada:');
            console.log(historiaFinal);
        } else {
            console.log('\n⚠️ No se recibió la historia final mejorada.');
        }
        if (analisisFinal) {
            console.log('\n📝 Análisis final:');
            console.log(analisisFinal);
        } else {
            console.log('\n⚠️ No se recibió el análisis final.');
        }

        // Cerrar las conexiones de los agentes
        console.log('\n🔄 Cerrando conexiones...');
        await writerAgent.disconnect();
        await analyzerAgent.disconnect();
        
        // Cerrar el servidor WebSocket
        transport.close();
        console.log('👋 Conexiones cerradas correctamente');

    } catch (error) {
        console.error('\n❌ Error durante la colaboración:', error);
        // Asegurar que las conexiones se cierren incluso en caso de error
        try {
            await writerAgent?.disconnect();
            await analyzerAgent?.disconnect();
            transport.close();
        } catch (closeError) {
            console.error('Error al cerrar las conexiones:', closeError);
        }
    }
}

main().catch(console.error); 