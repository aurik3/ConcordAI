import crypto from 'crypto';
import { Message } from '../types';
import logger from './logger';

export class Encryption {
    private algorithm = 'aes-256-cbc';
    private key: Buffer;

    constructor(encryptionKey: string) {
        this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
    }

    public encrypt(message: Message): string {
        try {
            const messageStr = JSON.stringify(message);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encrypted = cipher.update(messageStr, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const result = JSON.stringify({
                iv: iv.toString('hex'),
                encrypted: encrypted
            });

            logger.debug('Mensaje encriptado exitosamente');
            return result;
        } catch (error) {
            logger.error('Error al encriptar mensaje:', error);
            throw new Error('Error al encriptar mensaje');
        }
    }

    public decrypt(encryptedData: string): Message {
        try {
            const { iv, encrypted } = JSON.parse(encryptedData);
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.key,
                Buffer.from(iv, 'hex')
            );
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            const message = JSON.parse(decrypted) as Message;
            logger.debug('Mensaje desencriptado exitosamente');
            return message;
        } catch (error) {
            logger.error('Error al desencriptar mensaje:', error);
            throw new Error('Error al desencriptar mensaje');
        }
    }

    generateKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }
} 