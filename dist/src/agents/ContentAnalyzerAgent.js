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
const ai_1 = require("ai");
(0, dotenv_1.config)();
class ContentAnalyzerAgent extends BaseAIAgent_1.BaseAIAgent {
    constructor(agent, transport, auth) {
        super(agent, transport, auth);
        this.openai = (0, openai_1.createOpenAI)({
            apiKey: process.env.OPENAI_API_KEY || 'ddc-free-8e5171eeac9148ed89969cc31002d99d',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.devsdocode.com/v1',
        });
        console.log('\n🔍 ContentAnalyzerAgent inicializado');
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
        // Solo analizamos si es la historia inicial, ignoramos la versión mejorada
        if (message.content.action === 'historia_creada') {
            const { titulo, historia } = message.content.data;
            console.log('\n📊 Iniciando análisis de historia...');
            await this.updateStatus(types_1.AgentStatus.BUSY);
            try {
                if (!titulo || !historia) {
                    throw new Error('Datos incompletos: se requiere título e historia');
                }
                console.log('🤔 Analizando contenido con OpenAI...');
                const completion = await (0, ai_1.generateText)({
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
                            es_version_mejorada: false
                        }
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                await this.sendMessage(response);
            }
            catch (error) {
                console.error('\n❌ Error al analizar la historia:', error);
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
            await this.updateStatus(types_1.AgentStatus.ONLINE);
        }
    }
    async handleBroadcast(message) {
        logger_1.default.info('ContentAnalyzerAgent - handleBroadcast recibido:', message);
        // Aquí podrías agregar lógica para reaccionar a otros broadcasts si es necesario
    }
}
exports.ContentAnalyzerAgent = ContentAnalyzerAgent;
//# sourceMappingURL=ContentAnalyzerAgent.js.map