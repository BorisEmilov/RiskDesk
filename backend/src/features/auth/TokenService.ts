import { createHash, randomBytes, randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import type { AuthUser } from '../../common/identity.js' 
import { USER_ROLES } from '../../domain/enums.js' 
import { UnauthorizedError } from '../../domain/error.js' 

export interface TokenOptions {
  issuer: string
  audience: string
  signingKey: string
  accessTokenMinutes: number
}

const ClaimsSchema = z.object({
  sub: z.string(),
  op: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(USER_ROLES)
})

export class TokenService {
  constructor(private readonly options: TokenOptions){}

  createAccessToken(user: AuthUser): {token: string, expiresAt: Date} {
    const expiresAt = new Date(Date.now() + this.options.accessTokenMinutes * 60_000)
    const token = jwt.sign(
      {op: user.operatorId, name: user.name, email: user.email, role: user.role},
      this.options.signingKey,
      {
        algorithm: 'HS256',
        subject: user.id,
        issuer: this.options.issuer,
        audience: this.options.audience,
        expiresIn: this.options.accessTokenMinutes * 60,
        jwtid: randomUUID() 
      }
    )
    return {token, expiresAt}
  }

  verifyAccessToken(token: string): AuthUser {
    let payload: unknown
    try{
      payload = jwt.verify(token, this.options.signingKey, {
        algorithms: ['HS256'],
        issuer: this.options.issuer,
        audience: this.options.audience,
        clockTolerance: 30
      })
    } catch {
      throw new UnauthorizedError('Invalid or Expired token')
    }

    const claims = ClaimsSchema.safeParse(payload)
    if(!claims.success) throw new UnauthorizedError('Invalid token data')
    const c = claims.data
    return {id: c.sub, operatorId: c.op, name: c.name, email: c.email, role: c.role}
  }

  generaterefreshToken(): string {
    return randomBytes(64).toString('base64url')
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex')
  }
}
