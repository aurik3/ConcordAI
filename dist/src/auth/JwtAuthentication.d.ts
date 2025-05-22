import { Agent } from '../types';
export declare class JwtAuthentication {
    private readonly authKey;
    constructor(authKey: string);
    generateToken(agent: Agent): string;
    verifyToken(token: string): any;
}
