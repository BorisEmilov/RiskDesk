import { z } from 'zod'
import type { AuthUser } from '../../common/identity.js'
import { emailField } from '../../common/validation.js'
import { DetectorCatalog } from '../../detection/DetectorCatalog.js'
import type { UserRole } from '../../domain/enums.js'
import { ConflictError } from '../../domain/error.js'
import { type Database, isUniqueViolation, type Tx } from '../../infrastructure/database.js'
import type { Logger } from '../../infrastructure/logger.js'
import { ApiKeyService } from '../apiKeys/ApiKeyService.js'
import type { PasswordService } from '../PasswordService.js'
import type { TokenService } from './TokenService.js'


export const RegistrationSchema = z.object({
  operatorName: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(100),
  email: emailField,
  password: z.string().min(8, 'Min. 8 characters are required').max(100)
})
export type RegisterInput = z.infer<typeof RegistrationSchema>

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(256),
  password: z.string().min(1).max(100)
})


export interface UserDto {
  id: string
  name: string
  email: string
  role: UserRole
  operatorName: string
}

export interface AuthResponse {
  accessToken: string
  expiresAt: string
  user: UserDto
}

/** Lo que devuelve una emisión de sesión: el cuerpo JSON y el refresh token para la cookie HttpOnly. */
export interface IssuedSession {
  response: AuthResponse
  refreshToken: string
  refreshExpiresAt: Date
}

interface UserWithOperator {
  id: string
  operatorId: string
  name: string
  email: string
  role: UserRole
  operator: {name: string}
}

export class AuthService {
  private static readonly REUSE_GRACE_MS = 30_000

  constructor(
    private readonly db: Database,
    private readonly tokens: TokenService,
    private readonly passwords: PasswordService,
    private readonly refreshTokenDays: number,
    private readonly logger: Logger
  ){}

  async register(input: RegisterInput): Promise<IssuedSession & {apiKey: string}> {
    const passwordHash = await this.passwords.hash(input.password);
    const apiKey = ApiKeyService.generate();
    try {
      return await this.db.inTransaction(async (tx) => {
        const operator = await tx.operator.create({
          data: {
            name: input.operatorName,
            apiKeyHash: ApiKeyService.hash(apiKey),
            apiKeyPrefix: ApiKeyService.prefix(apiKey)
          }
        })
        const user = await tx.user.create({
          data: {
            operatorId: operator.id,
            email: input.email,
            name: input.name,
            role: 'Admin',
            passwordHash
          },
          include: {operator: {select: {name: true}}}
        });
        await tx.detectorSetting.createMany({data: DetectorCatalog.defaultSettings(operator.id)})
        
        const result = await this.issue(tx, user);
        return {...result, apiKey}
      })
    } catch (err) {
      if(isUniqueViolation(err)) throw new ConflictError('Email alredy exists')
      throw err
    }
  }

  
  async login(email: string, password: string): Promise<IssuedSession | null>{
    const user = await this.db.client.user.findUnique({
      where: {email: email.trim().toLowerCase()},
      include: {operator: {select: {name: true}}}
    });
    const valid = await this.passwords.verify(password, user?.passwordHash);
    if(!user || !valid || !user.isActive) return null;
    return this.db.inTransaction((tx) => this.issue(tx, user));
  }

  
  async refresh(token: string): Promise<IssuedSession | null> {
    const hash = this.tokens.hashToken(token);
    const stored = await this.db.client.refreshToken.findUnique({
      where: {tokenHash: hash},
      include: {user: {include: {operator: {select: {name: true}}}}}
    });
    if(!stored) return null;

    if(stored.revokedAt){
      if(Date.now() - stored.revokedAt.getTime() > AuthService.REUSE_GRACE_MS){
        // Reutilizar un token ya rotado (fuera del margen de carreras) indica robo: se cierran todas las sesiones
        await this.revokeAll(stored.userId)
        this.logger.warn({userId: stored.userId}, 'Token reuse: all sessions revoked')
      }
      return null;
    }
   
    if(stored.expiresAt.getTime() <= Date.now() || !stored.user.isActive) return null;

    return await this.db.inTransaction(async (tx) => {
      const revoked = await tx.refreshToken.updateMany({
        where: {id: stored.id, revokedAt: null},
        data: {revokedAt: new Date()}
      });
      if(revoked.count === 0) return null;
      const result = await this.issue(tx, stored.user);
      await tx.refreshToken.update({
        where: {id: stored.id},
        data: {replacedByTokenHash: this.tokens.hashToken(result.refreshToken)}
      })
      return result
    })
  }


  async logout(token: string) {
    await this.db.client.refreshToken.updateMany({
      where: {tokenHash: this.tokens.hashToken(token), revokedAt: null},
      data: {revokedAt: new Date()}
    })
  }

  
  async revokeAll(userId: string) {
    await this.db.client.refreshToken.updateMany({
      where: {userId, revokedAt: null},
      data: {revokedAt: new Date()}
    })
  }


  private async issue(tx: Tx, user: UserWithOperator): Promise<IssuedSession> {
    const identity: AuthUser = {
      id: user.id,
      operatorId: user.operatorId,
      name: user.name,
      email: user.email,
      role: user.role
    }

    const access = this.tokens.createAccessToken(identity);
    const refreshToken = this.tokens.generaterefreshToken();
    const refreshHash = this.tokens.hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.refreshTokenDays * 24 * 60 * 60 * 1000);
    
    await tx.refreshToken.create({
      data: {userId: user.id, tokenHash: refreshHash, expiresAt: refreshExpiresAt}
    });

    return {
      response: {
        accessToken: access.token,
        expiresAt: access.expiresAt.toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          operatorName: user.operator.name,
        },
      },
      refreshToken,
      refreshExpiresAt,
    }
  }
}
