import { Message, MessageType, AgentStatus, MessagePriority } from '../types';
import { BaseAIAgent } from './BaseAIAgent';
import { createOpenAI } from '@ai-sdk/openai';
import { config } from 'dotenv';
import logger from '../utils/logger';
import { generateText} from 'ai';

config();

export class ContentAnalyzerAgent extends BaseAIAgent {
    private openai: any;

    constructor(agent: any, transport: any, auth: any) {
        super(agent, transport, auth);
        this.openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'ddc-free-8e5171eeac9148ed89969cc31002d99d',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.devsdocode.com/v1',
        });
        console.log('\n🔍 ContentAnalyzerAgent inicializado');
    }

    protected async handleCollaborationRequest(message: Message): Promise<void> {
        logger.info('ContentAnalyzerAgent - handleCollaborationRequest:', message);

        if (message.content.action === 'identificar_capacidades') {
            const response: Message = {
                id: 'respuesta-capacidades',
                senderId: this.agent.id,
                receiverId: message.senderId,
                type: MessageType.COLLABORATION_RESPONSE,
                content: {
                    action: 'confirmar_capacidades',
                    capabilities: this.agent.capabilities,
                    ready: true
                },
                timestamp: Date.now(),
                priority: MessagePriority.HIGH,
                encryption: true
            };
            logger.info('ContentAnalyzerAgent - Enviando respuesta de capacidades');
            await this.sendMessage(response);
        }
    }

    protected async handleTaskCompletion(message: Message): Promise<void> {
        logger.info('ContentAnalyzerAgent - handleTaskCompletion recibido:', message);
        
        // Solo analizamos si es la historia inicial, ignoramos la versión mejorada
        if (message.content.action === 'historia_creada') {
            const { titulo, historia } = message.content.data;
            
            console.log('\n📊 Iniciando análisis de historia...');
            await this.updateStatus(AgentStatus.BUSY);
            
            try {
                if (!titulo || !historia) {
                    throw new Error('Datos incompletos: se requiere título e historia');
                }
                
                console.log('🤔 Analizando contenido con OpenAI...');
                
                const completion = await generateText({
                    model: this.openai("provider-2/gpt-4o"),
                    messages: [
                        {
                            role: "system",
                            content: "Eres un analista de contenido especializado en evaluar historias infantiles. Tu tarea es proporcionar un análisis detallado y constructivo que incluya: mensaje principal, valores transmitidos, nivel de complejidad, elementos educativos y sugerencias de mejora. El análisis debe ser conciso y fácil de entender."
                        },
                        {
                            role: "user",
                            content: `Analiza la siguiente historia infantil y proporciona un análisis estructurado:
                            
                            Título: ${titulo}
                            
                            Historia: ${historia}
                            
                            Por favor, proporciona el análisis en el siguiente formato:

                            📖 ANÁLISIS DE LA HISTORIA
                            ------------------------
                            
                            🎯 Mensaje Principal:
                            [Breve descripción del mensaje principal]
                            
                            💫 Valores Transmitidos:
                            • [Valor 1]
                            • [Valor 2]
                            • [Valor 3]
                            
                            📊 Nivel de Complejidad:
                            [Descripción del nivel de complejidad y edad recomendada]
                            
                            📚 Elementos Educativos:
                            • [Elemento 1]
                            • [Elemento 2]
                            • [Elemento 3]
                            
                            💡 Sugerencias de Mejora:
                            • [Sugerencia 1]
                            • [Sugerencia 2]
                            • [Sugerencia 3]`
                        }
                    ],
                });

                if (!completion.text) {
                    throw new Error('No se recibió respuesta válida de OpenAI');
                }

                const analisis = completion.text;
                console.log('\n' + analisis + '\n');
                console.log('📤 Enviando análisis...\n');

                const response: Message = {
                    id: 'analisis-completado',
                    senderId: this.agent.id,
                    receiverId: message.senderId,
                    type: MessageType.TASK_COMPLETION,
                    content: {
                        action: 'analisis_completado',
                        data: {
                            titulo: titulo,
                            historia: historia,
                            analisis: analisis,
                            es_version_mejorada: false
                        }
                    },
                    timestamp: Date.now(),
                    priority: MessagePriority.HIGH,
                    encryption: true
                };

                await this.sendMessage(response);
            } catch (error) {
                console.error('\n❌ Error al analizar la historia:', error);
                const errorMessage: Message = {
                    id: 'error-analisis',
                    senderId: this.agent.id,
                    receiverId: message.senderId,
                    type: MessageType.ERROR,
                    content: {
                        action: 'error',
                        error: error instanceof Error ? error.message : 'Error al analizar la historia'
                    },
                    timestamp: Date.now(),
                    priority: MessagePriority.HIGH,
                    encryption: true
                };
                await this.sendMessage(errorMessage);
            }
            await this.updateStatus(AgentStatus.ONLINE);
        }
    }

    protected async handleBroadcast(message: Message): Promise<void> {
        logger.info('ContentAnalyzerAgent - handleBroadcast recibido:', message);
        // Aquí podrías agregar lógica para reaccionar a otros broadcasts si es necesario
    }
} 