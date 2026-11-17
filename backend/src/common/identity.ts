import type { Request } from 'express'
import type { UserRole } from '../domain/enums.js'
import { UnauthorizedError } from '../domain/error.js'

export interface AuthUser {
  id: string
  operatorId: string
  name: string
  email: string
  role: UserRole
}


declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
      operatorId?: string
    }
  }
}


export class Actor {
  constructor(
    readonly userId: string | null,
    readonly name: string
  ){}

  static readonly system = new Actor(null, 'System')

  static asi(model: string) {
    return new Actor(null, `IA (${model})`.slice(0, 100))
  }

  static from(user: AuthUser) {
    return new Actor(user.id, user.name)
  }
}

export function currentUser(req: Request): AuthUser {
  if(!req.user) throw new UnauthorizedError('Invalid session')
    return req.user;
}

export function currentOperatorId(req: Request): string {
  if(!req.operatorId) throw new UnauthorizedError('No operator')
    return req.operatorId
}

export const isAdmin = (user: AuthUser) => user.role === 'Admin'
