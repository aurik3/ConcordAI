import { createOpenAI } from '@ai-sdk/openai';
import { Message, MessageType, AgentStatus, MessagePriority } from '../types';
import { BaseAIAgent } from './BaseAIAgent';
import { config } from 'dotenv';
import logger from '../utils/logger';
import { generateText } from 'ai';

config();

export class StoryWriterAgent extends BaseAIAgent {
    private openai: any;

    constructor(agent: any, transport: any, auth: any) {
        super(agent, transport, auth);
        this.openai = createOpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'ddc-free-8e5171eeac9148ed89969cc31002d99d',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.devsdocode.com/v1',
        });
        console.log('\n📝 StoryWriterAgent inicializado');
    }

    protected async handleCollaborationRequest(message: Message): Promise<void> {
        logger.info('StoryWriterAgent - handleCollaborationRequest:', message);
        
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
            logger.info('StoryWriterAgent - Enviando respuesta de capacidades');
            await this.sendMessage(response);
        }
    }

    protected async handleTaskCompletion(message: Message): Promise<void> {
        // Ya no procesamos mensajes de análisis
        logger.info('StoryWriterAgent - handleTaskCompletion ignorado:', message);
    }

    protected async handleBroadcast(message: Message): Promise<void> {
        logger.info('StoryWriterAgent - handleBroadcast recibido:', message);
        if (message.content.action === 'crear_historia') {
            console.log('\n🎨 Iniciando creación de historia...');
            await this.updateStatus(AgentStatus.BUSY);
            try {
                console.log('🤔 Generando historia con OpenAI...');
                const completion = await generateText({
                    model: this.openai("provider-2/gpt-4o"),
                    messages: [
                        {
                            role: "system",
                            content: "Eres un escritor creativo especializado en crear historias cortas para niños. Tu tarea es crear una historia breve (máximo 3 párrafos), interesante, educativa y cautivadora que transmita valores positivos. La historia debe tener un título atractivo y estar bien estructurada."
                        },
                        {
                            role: "user",
                            content: `Crea una historia corta sobre ${message.content.data.tema} que enseñe sobre ${message.content.data.valores.join(' y ')}. La historia debe ser breve y fácil de entender. Incluye un título atractivo y estructura la historia en párrafos claros.`
                        }
                    ]
                });
                const historia = completion.text;
                
                // Formatear la historia para la consola
                console.log('\n📚 NUEVA HISTORIA CREADA');
                console.log('======================');
                console.log('\n' + historia);
                console.log('\n✨ Fin de la historia');
                console.log('====================\n');
                
                const response: Message = {
                    id: 'historia-creada',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: MessageType.TASK_COMPLETION,
                    content: {
                        action: 'historia_creada',
                        data: {
                            titulo: message.content.data.tema,
                            historia: historia
                        }
                    },
                    timestamp: Date.now(),
                    priority: MessagePriority.HIGH,
                    encryption: true
                };
                console.log('📤 Enviando historia creada...\n');
                await this.sendMessage(response);
            } catch (error) {
                console.error('\n❌ Error al generar la historia:', error);
                const errorMessage: Message = {
                    id: 'error-historia',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: MessageType.ERROR,
                    content: {
                        action: 'error',
                        error: 'Error al generar la historia'
                    },
                    timestamp: Date.now(),
                    priority: MessagePriority.HIGH,
                    encryption: true
                };
                await this.sendMessage(errorMessage);
            } finally {
                await this.updateStatus(AgentStatus.ONLINE);
            }
        }
    }
} 