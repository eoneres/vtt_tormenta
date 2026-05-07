import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '@vtt/shared-types';

export interface JwtStrategyOptions {
  publicKey: string;
  issuer: string;
  audience?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(options: JwtStrategyOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.publicKey,
      algorithms: ['RS256'],
      issuer: options.issuer,
      audience: options.audience,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.roles) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
