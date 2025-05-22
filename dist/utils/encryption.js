"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encryption = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("./logger"));
class Encryption {
    constructor(encryptionKey) {
        this.algorithm = 'aes-256-cbc';
        this.key = crypto_1.default.scryptSync(encryptionKey, 'salt', 32);
    }
    encrypt(message) {
        try {
            const messageStr = JSON.stringify(message);
            const iv = crypto_1.default.randomBytes(16);
            const cipher = crypto_1.default.createCipheriv(this.algorithm, this.key, iv);
            let encrypted = cipher.update(messageStr, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const result = JSON.stringify({
                iv: iv.toString('hex'),
                encrypted: encrypted
            });
            logger_1.default.debug('Mensaje encriptado exitosamente');
            return result;
        }
        catch (error) {
            logger_1.default.error('Error al encriptar mensaje:', error);
            throw new Error('Error al encriptar mensaje');
        }
    }
    decrypt(encryptedData) {
        try {
            const { iv, encrypted } = JSON.parse(encryptedData);
            const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            const message = JSON.parse(decrypted);
            logger_1.default.debug('Mensaje desencriptado exitosamente');
            return message;
        }
        catch (error) {
            logger_1.default.error('Error al desencriptar mensaje:', error);
            throw new Error('Error al desencriptar mensaje');
        }
    }
    generateKey() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
}
exports.Encryption = Encryption;
//# sourceMappingURL=encryption.js.map