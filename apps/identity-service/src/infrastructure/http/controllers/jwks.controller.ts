import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { createPublicKey } from 'crypto';

@ApiTags('jwks')
@Controller('.well-known')
export class JwksController {
  private readonly jwks: { keys: object[] };

  constructor(private readonly config: ConfigService) {
    this.jwks = this.buildJwks();
  }

  @Get('jwks.json')
  @ApiOperation({ summary: 'JSON Web Key Set — public keys for JWT RS256 validation' })
  getJwks(): { keys: object[] } {
    return this.jwks;
  }

  private buildJwks(): { keys: object[] } {
    const publicKeyPem = this.config
      .getOrThrow<string>('JWT_PUBLIC_KEY')
      .replace(/\\n/g, '\n');

    const publicKey = createPublicKey(publicKeyPem);
    const jwk = publicKey.export({ format: 'jwk' });

    return {
      keys: [
        {
          ...jwk,
          use: 'sig',
          alg: 'RS256',
          kid: 'vtt-identity-key-1',
        },
      ],
    };
  }
}
