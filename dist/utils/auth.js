"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Authentication {
    constructor(secretKey) {
        this.secretKey = secretKey;
    }
    generateToken(agent) {
        return jsonwebtoken_1.default.sign({
            id: agent.id,
            name: agent.name,
            capabilities: agent.capabilities
        }, this.secretKey, { expiresIn: '24h' });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secretKey);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    generateSecretKey() {
        return require('crypto').randomBytes(64).toString('hex');
    }
}
exports.Authentication = Authentication;
//# sourceMappingURL=auth.js.map