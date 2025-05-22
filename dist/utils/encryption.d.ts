import { Message } from '../types';
export declare class Encryption {
    private algorithm;
    private key;
    constructor(encryptionKey: string);
    encrypt(message: Message): string;
    decrypt(encryptedData: string): Message;
    generateKey(): string;
}
