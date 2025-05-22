"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtAuthentication {
    constructor(authKey) {
        this.authKey = authKey;
    }
    generateToken(agent) {
        return jsonwebtoken_1.default.sign({
            id: agent.id,
            name: agent.name,
            capabilities: agent.capabilities
        }, this.authKey, { expiresIn: '24h' });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.authKey);
        }
        catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }
}
exports.JwtAuthentication = JwtAuthentication;
//# sourceMappingURL=JwtAuthentication.js.map