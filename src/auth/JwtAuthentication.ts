import jwt from 'jsonwebtoken';
import { Agent } from '../types';

export class JwtAuthentication {
    private readonly authKey: string;

    constructor(authKey: string) {
        this.authKey = authKey;
    }

    public generateToken(agent: Agent): string {
        return jwt.sign(
            {
                id: agent.id,
                name: agent.name,
                capabilities: agent.capabilities
            },
            this.authKey,
            { expiresIn: '24h' }
        );
    }

    public verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.authKey);
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }
} 