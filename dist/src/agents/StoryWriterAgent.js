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
const ai_1 = require("ai");
(0, dotenv_1.config)();
class StoryWriterAgent extends BaseAIAgent_1.BaseAIAgent {
    constructor(agent, transport, auth) {
        super(agent, transport, auth);
        this.openai = (0, openai_1.createOpenAI)({
            apiKey: process.env.OPENAI_API_KEY || 'ddc-free-8e5171eeac9148ed89969cc31002d99d',
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.devsdocode.com/v1',
        });
        console.log('\n📝 StoryWriterAgent inicializado');
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
        // Ya no procesamos mensajes de análisis
        logger_1.default.info('StoryWriterAgent - handleTaskCompletion ignorado:', message);
    }
    async handleBroadcast(message) {
        logger_1.default.info('StoryWriterAgent - handleBroadcast recibido:', message);
        if (message.content.action === 'crear_historia') {
            console.log('\n🎨 Iniciando creación de historia...');
            await this.updateStatus(types_1.AgentStatus.BUSY);
            try {
                console.log('🤔 Generando historia con OpenAI...');
                const completion = await (0, ai_1.generateText)({
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
                const response = {
                    id: 'historia-creada',
                    senderId: this.agent.id,
                    receiverId: 'all',
                    type: types_1.MessageType.TASK_COMPLETION,
                    content: {
                        action: 'historia_creada',
                        data: {
                            titulo: message.content.data.tema,
                            historia: historia
                        }
                    },
                    timestamp: Date.now(),
                    priority: types_1.MessagePriority.HIGH,
                    encryption: true
                };
                console.log('📤 Enviando historia creada...\n');
                await this.sendMessage(response);
            }
            catch (error) {
                console.error('\n❌ Error al generar la historia:', error);
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