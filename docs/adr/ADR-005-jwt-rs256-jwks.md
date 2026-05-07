# ADR-005: JWT RS256 com JWKS Rotation para Autenticação

**Status**: Aceito  
**Data**: 2025-05  
**Contexto**: Modelagem VTT Multissistema v1.0

## Contexto

Com múltiplos microserviços, cada serviço precisa validar tokens de autenticação sem depender de uma chamada síncrona ao identity-service em cada request (latência + SPOF).

## Decisão

Usar **JWT RS256** (assimétrico):
- `identity-service` assina tokens com **chave privada RSA**
- Todos os outros serviços validam com **chave pública** via endpoint JWKS (`/.well-known/jwks.json`)
- Chaves rotacionadas a cada **90 dias** com período de overlap de 24h
- Access token: **15 minutos** (curto para limitar janela de comprometimento)
- Refresh token: **opaque** (não JWT), armazenado no Redis com TTL de 30 dias, rotacionado a cada uso

Fluxo de refresh:
```
1. Cliente envia refresh_token (httpOnly cookie)
2. identity-service valida no Redis
3. Invalida o token antigo (rotation)
4. Emite novo access_token + novo refresh_token
5. Detecta reuso de refresh_token revogado → invalida toda a família (token family)
```

## Consequências

**Positivas:**
- Validação de JWT sem chamada ao identity-service (chave pública cacheada)
- Rotação de chaves sem downtime (JWKS com múltiplas chaves ativas)
- Refresh token rotation previne token theft

**Negativas:**
- Access tokens não são revogáveis antes do TTL (mitigado pelo TTL curto de 15min)
- Necessidade de JWKS endpoint sempre disponível (cacheado nos serviços)

## Alternativas Rejeitadas

- **JWT HS256 (simétrico)**: rejeitado por exigir compartilhamento de secret entre todos os serviços
- **Session-based (stateful)**: rejeitado por criar dependência síncrona do identity-service em cada request
- **Opaque tokens**: rejeitado por exigir introspection call em cada request
