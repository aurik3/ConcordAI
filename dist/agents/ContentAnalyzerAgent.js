"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentAnalyzerAgent = void 0;
const types_1 = require("../types");
const BaseAIAgent_1 = require("./BaseAIAgent");
const openai_1 = require("@ai-sdk/openai");
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../utils/logger"));
(0, dotenv_1.config)();
class ContentAnalyzerAgent extends BaseAIAgent_1.BaseAIAgent {
    constructor(agent, transport, auth) {
        super(agent, transport, auth);
        this.openai = (0, openai_1.createOpenAI)({
            apiKey: process.env.OPENAI_API_KEY || 'ddc-free-8e5171eeac9148ed89969cc31002d99d',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.devsdocode.com/v1',
        });
        logger_1.default.info('ContentAnalyzerAgent inicializado');
    }
    async handleCollaborationRequest(message) {
        logger_1.default.info('ContentAnalyzerAgent - handleCollaborationRequest:', message);
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
            logger_1.default.info('ContentAnalyzerAgent - Enviando respuesta de capacidades');
            await this.sendMessage(response);
        }
    }
    async handleTaskCompletion(message) {
        logger_1.default.info('ContentAnalyzerAgent - handleTaskCompletion recibido:', message);
        if (message.content.action === 'historia_creada' || message.content.action === 'historia_mejorada') {
            logger_1.default.info('ContentAnalyzerAgent - Iniciando análisis de historia');
            await this.updateStatus(types_1.AgentStatus.BUSY);
            try {
                const { titulo, historia, analisis_previo } = message.content.data;
                if (!titulo || !historia) {
                    throw new Error('Datos incompletos: se requiere título e historia');
                }
                logger_1.default.info('ContentAnalyzerAgent - Datos recibidos:', { titulo, historia });
                logger_1.default.info('ContentAnalyzerAgent - Llamando a OpenAI');
                const completion = await this.openai.chat.completions.create({
                    model: "provider-2/gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un analista de contenido especializado en evaluar historias infantiles. Tu tarea es proporcionar un análisis detallado y constructivo que incluya: mensaje principal, valores transmitidos, nivel de complejidad, elementos educativos y sugerencias de mejora."
                        },
                        {
                            role: "user",
                            content: `Analiza la siguiente historia infantil y proporciona un análisis detallado:
                            
                            Título: ${titulo}
                            
                            Historia: ${historia}
                            ${analisis_previo ? `\nAnálisis previo para comparación:\n${analisis_previo}` : ''}
                            
                            Por favor, analiza:
                            1. Mensaje principal
                            2. Valores transmitidos
                            3. Nivel de complejidad
                            4. Elementos educativos
                            5. Sugerencias de mejora
                            ${analisis_previo ? '6. Comparación con la versión anterior y mejoras realizadas' : ''}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                });
                if (!completion.choices?.[0]?.message?.content) {
                    throw new Error('No se recibió respuesta válida de OpenAI');
                }
                const analisis = completion.choices[0].message.content;
                logger_1.default.info('ContentAnalyzerAgent - Análisis generado:', analisis);
                const response = {
                    id: 'analisis-completado',
                    senderId: this.agent.id,
                    receiverId: message.senderId,
                    type: types_1.MessageType.TASK_COMPLETION,
                    content: {
                        action: 'analisis_completado',
                        data: {
                            titulo: titulo,
                            historia: historia,
                            analisis: analisis,
                            es_version_mejorada: message.content.action === 'historia_mejorada'
                        }
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                logger_1.default.info('ContentAnalyzerAgent - Enviando análisis');
                await this.sendMessage(response);
            }
            catch (error) {
                logger_1.default.error('ContentAnalyzerAgent - Error al analizar la historia:', error);
                const errorMessage = {
                    id: 'error-analisis',
                    senderId: this.agent.id,
                    receiverId: message.senderId,
                    type: types_1.MessageType.ERROR,
                    content: {
                        action: 'error',
                        error: error instanceof Error ? error.message : 'Error al analizar la historia'
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
        logger_1.default.info('ContentAnalyzerAgent - handleBroadcast recibido:', message);
        // Aquí podrías agregar lógica para reaccionar a otros broadcasts si es necesario
    }
}
exports.ContentAnalyzerAgent = ContentAnalyzerAgent;
//# sourceMappingURL=ContentAnalyzerAgent.js.map