import { Agent } from '../types';
export declare class Authentication {
    private secretKey;
    constructor(secretKey: string);
    generateToken(agent: Agent): string;
    verifyToken(token: string): any;
    generateSecretKey(): string;
}
