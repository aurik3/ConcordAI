import jwt from 'jsonwebtoken';
import { Agent } from '../types';

export class Authentication {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  generateToken(agent: Agent): string {
    return jwt.sign(
      {
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities
      },
      this.secretKey,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  generateSecretKey(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }
} 