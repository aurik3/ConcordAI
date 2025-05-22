"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryWriterAgent = void 0;
const openai_1 = require("@ai-sdk/openai");
const types_1 = require("../types");
const BaseAIAgent_1 = require("./BaseAIAgent");
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../utils/logger"));
(0, dotenv_1.config)();
class StoryWriterAgent extends BaseAIAgent_1.BaseAIAgent {
    constructor(agent, transport, auth) {
        super(agent, transport, auth);
        this.openai = (0, openai_1.createOpenAI)({
            apiKey: process.env.OPENAI_API_KEY || 'ddc-free-8e5171eeac9148ed89969cc31002d99d',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.devsdocode.com/v1',
        });
        logger_1.default.info('StoryWriterAgent inicializado');
    }
    async handleCollaborationRequest(message) {
        logger_1.default.info('StoryWriterAgent - handleCollaborationRequest:', message);
        if (message.content.action === 'identificar_capacidades') {
            const response = {
                id: 'respuesta-capacidades',
                senderId: this.agent.id,
                receiverId: message.senderId,
                type: types_1.MessageType.COLLABORATION_RESPONSE,
                content: {
                    action: 'confirmar_capacidades',
                    capabilities: this.agent.capabilities,
                    ready: true
                },
                timestamp: Date.now(),
                priority: types_1.MessagePriority.HIGH,
                encryption: true
            };
            logger_1.default.info('StoryWriterAgent - Enviando respuesta de capacidades');
            await this.sendMessage(response);
        }
    }
    async handleTaskCompletion(message) {
        logger_1.default.info('StoryWriterAgent - handleTaskCompletion:', message);
        if (message.content.action === 'analisis_completado') {
            logger_1.default.info('StoryWriterAgent - Análisis recibido:', message.content.data);
            const { titulo, analisis } = message.content.data;
            logger_1.default.info(`StoryWriterAgent - Análisis recibido para la historia "${titulo}":`, analisis);
            await this.updateStatus(types_1.AgentStatus.BUSY);
            try {
                logger_1.default.info('StoryWriterAgent - Iniciando mejora de la historia basada en el análisis');
                const completion = await this.openai.chat.completions.create({
                    model: "provider-2/gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un escritor creativo especializado en mejorar historias infantiles. Tu tarea es mejorar la historia basándote en el análisis proporcionado, manteniendo el mensaje principal pero incorporando las sugerencias de mejora."
                        },
                        {
                            role: "user",
                            content: `Basándote en el siguiente análisis, mejora la historia manteniendo su esencia pero incorporando las sugerencias:

                            Análisis:
                            ${analisis}

                            Por favor, proporciona una versión mejorada de la historia que:
                            1. Mantenga el mensaje principal
                            2. Incorpore los valores identificados
                            3. Ajuste el nivel de complejidad si es necesario
                            4. Refuerce los elementos educativos
                            5. Implemente las sugerencias de mejora`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                });
                const historiaMejorada = completion.choices[0].message.content;
                logger_1.default.info('StoryWriterAgent - Historia mejorada generada');
                const response = {
                    id: 'historia-mejorada',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: types_1.MessageType.TASK_COMPLETION,
                    content: {
                        action: 'historia_mejorada',
                        data: {
                            titulo: titulo,
                            historia: historiaMejorada,
                            analisis_previo: analisis
                        }
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                logger_1.default.info('StoryWriterAgent - Enviando historia mejorada');
                await this.sendMessage(response);
            }
            catch (error) {
                logger_1.default.error('StoryWriterAgent - Error al mejorar la historia:', error);
                const errorMessage = {
                    id: 'error-mejora',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: types_1.MessageType.ERROR,
                    content: {
                        action: 'error',
                        error: error instanceof Error ? error.message : 'Error al mejorar la historia'
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                await this.sendMessage(errorMessage);
            }
            finally {
                await this.updateStatus(types_1.AgentStatus.ONLINE);
            }
        }
    }
    async handleBroadcast(message) {
        logger_1.default.info('StoryWriterAgent - handleBroadcast recibido:', message);
        if (message.content.action === 'crear_historia') {
            logger_1.default.info('StoryWriterAgent - Iniciando creación de historia');
            await this.updateStatus(types_1.AgentStatus.BUSY);
            try {
                logger_1.default.info('StoryWriterAgent - Llamando a OpenAI');
                const completion = await this.openai.chat.completions.create({
                    model: "provider-2/gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un escritor creativo especializado en crear historias cortas para niños. Tu tarea es crear una historia interesante, educativa y cautivadora que transmita valores positivos."
                        },
                        {
                            role: "user",
                            content: "Crea una historia corta sobre una aventura en un bosque que enseñe sobre la amistad y el trabajo en equipo."
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                });
                const historia = completion.choices[0].message.content;
                logger_1.default.info('StoryWriterAgent - Historia generada:', historia);
                const response = {
                    id: 'historia-creada',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: types_1.MessageType.TASK_COMPLETION,
                    content: {
                        action: 'historia_creada',
                        data: {
                            titulo: "La Aventura en el Bosque",
                            historia: historia
                        }
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                logger_1.default.info('StoryWriterAgent - Enviando historia creada');
                await this.sendMessage(response);
            }
            catch (error) {
                logger_1.default.error('StoryWriterAgent - Error al generar la historia:', error);
                const errorMessage = {
                    id: 'error-historia',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: types_1.MessageType.ERROR,
                    content: {
                        action: 'error',
                        error: 'Error al generar la historia'
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                await this.sendMessage(errorMessage);
            }
            finally {
                await this.updateStatus(types_1.AgentStatus.ONLINE);
            }
        }
    }
}
exports.StoryWriterAgent = StoryWriterAgent;
//# sourceMappingURL=StoryWriterAgent.js.map