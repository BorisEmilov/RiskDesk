import type { RequestHandler } from 'express'
import type { UserRole } from '../domain/enums.js'
import { ForbiddenError, UnauthorizedError } from '../domain/error.js'
import type { ApiKeyService } from '../features/apiKeys/ApiKeyService.js'
import type { TokenService } from '../features/auth/TokenService.js'

export const API_KEY_HEADER = 'x-api-key';

export class AuthMiddleware{
  constructor(
    private readonly tokens: TokenService,
    private readonly apiKeys: ApiKeyService
  ){}

  requireUser: RequestHandler = (req, _res, next) => {
    const header = req.headers.authorization;
    if(!header?.startsWith('Bearer ')) throw new UnauthorizedError('Access token missing');
    const user = this.tokens.verifyAccessToken(header.slice('Bearer '.length).trim());
    req.user = user;
    req.operatorId = user.operatorId;
    next();
  }

  requireRole(role: UserRole): RequestHandler {
    return (req, _res, next) => {
      if(!req.user) throw new UnauthorizedError('Invalid session');
      if(req.user.role !== role) throw new ForbiddenError('Insuficent role');
      next();
    }
  }

  requireApiKey: RequestHandler = async (req, _res, next) => {
    const key = req.header(API_KEY_HEADER);
    if(!key) throw new UnauthorizedError('missing header x-api-key');
    const operatorId = await this.apiKeys.resolve(key);
    if(!operatorId) throw new UnauthorizedError('Incorrect api key');
    req.operatorId = operatorId;
    next();
  }
}
