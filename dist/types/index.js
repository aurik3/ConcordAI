"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportType = exports.MessagePriority = exports.MessageType = exports.AgentCapability = exports.AgentStatus = void 0;
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["ONLINE"] = "ONLINE";
    AgentStatus["OFFLINE"] = "OFFLINE";
    AgentStatus["BUSY"] = "BUSY";
    AgentStatus["IDLE"] = "IDLE";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var AgentCapability;
(function (AgentCapability) {
    AgentCapability["TEXT_PROCESSING"] = "TEXT_PROCESSING";
    AgentCapability["IMAGE_PROCESSING"] = "IMAGE_PROCESSING";
    AgentCapability["DATA_ANALYSIS"] = "DATA_ANALYSIS";
    AgentCapability["DECISION_MAKING"] = "DECISION_MAKING";
    AgentCapability["LEARNING"] = "LEARNING";
    AgentCapability["COLLABORATION"] = "COLLABORATION";
    AgentCapability["TASK_MANAGEMENT"] = "TASK_MANAGEMENT";
    AgentCapability["NATURAL_LANGUAGE_PROCESSING"] = "NATURAL_LANGUAGE_PROCESSING";
    AgentCapability["MACHINE_LEARNING"] = "MACHINE_LEARNING";
    AgentCapability["COMPUTER_VISION"] = "COMPUTER_VISION";
    AgentCapability["SPEECH_RECOGNITION"] = "SPEECH_RECOGNITION";
    AgentCapability["REASONING"] = "REASONING";
    AgentCapability["PLANNING"] = "PLANNING";
    AgentCapability["CREATIVE_WRITING"] = "CREATIVE_WRITING";
    AgentCapability["CONTENT_ANALYSIS"] = "CONTENT_ANALYSIS";
})(AgentCapability || (exports.AgentCapability = AgentCapability = {}));
var MessageType;
(function (MessageType) {
    MessageType["REGISTER"] = "register";
    MessageType["REQUEST"] = "REQUEST";
    MessageType["RESPONSE"] = "RESPONSE";
    MessageType["BROADCAST"] = "BROADCAST";
    MessageType["ERROR"] = "ERROR";
    MessageType["STATUS_UPDATE"] = "STATUS_UPDATE";
    MessageType["CAPABILITY_UPDATE"] = "CAPABILITY_UPDATE";
    MessageType["TASK_ASSIGNMENT"] = "TASK_ASSIGNMENT";
    MessageType["TASK_COMPLETION"] = "TASK_COMPLETION";
    MessageType["COLLABORATION_REQUEST"] = "COLLABORATION_REQUEST";
    MessageType["COLLABORATION_RESPONSE"] = "COLLABORATION_RESPONSE";
    MessageType["LEARNING_REQUEST"] = "LEARNING_REQUEST";
    MessageType["LEARNING_RESPONSE"] = "LEARNING_RESPONSE";
})(MessageType || (exports.MessageType = MessageType = {}));
var MessagePriority;
(function (MessagePriority) {
    MessagePriority["LOW"] = "LOW";
    MessagePriority["MEDIUM"] = "MEDIUM";
    MessagePriority["HIGH"] = "HIGH";
    MessagePriority["CRITICAL"] = "CRITICAL";
})(MessagePriority || (exports.MessagePriority = MessagePriority = {}));
var TransportType;
(function (TransportType) {
    TransportType["WEBSOCKET"] = "WEBSOCKET";
    TransportType["HTTP"] = "HTTP";
    TransportType["GRPC"] = "GRPC";
})(TransportType || (exports.TransportType = TransportType = {}));
//# sourceMappingURL=index.js.map