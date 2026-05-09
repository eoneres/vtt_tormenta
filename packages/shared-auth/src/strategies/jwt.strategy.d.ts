import { Strategy } from 'passport-jwt';
import type { JwtPayload } from '@vtt/shared-types';
export interface JwtStrategyOptions {
    publicKey: string;
    issuer: string;
    audience?: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(options: JwtStrategyOptions);
    validate(payload: JwtPayload): JwtPayload;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map