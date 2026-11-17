import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { AppError, ValidationError } from '../domain/error.js'
import type { Logger } from '../infrastructure/logger.js'


interface Problem {
  status: number
  title: string
  detail?: string
  errors?: Record<string, string[]>
}

export class ErrorHandler {
  constructor(private readonly logger: Logger){}

  notFound = (req: Request, res: Response) => {
    this.send(res, {
      status: 404,
      title: 'Route not found',
      detail: `${req.method} ${req.path}`
    })
  }

  handle = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    this.send(res, this.toProblem(err, req))
  }

  private toProblem(err: unknown, req: Request): Problem {
    if(err instanceof ValidationError){
      return {status: 400, title: err.title, detail: err.message, errors: err.errors}
    }
    if(err instanceof AppError) return {status: err.status, title: err.title, detail: err.message}
    
    if(err instanceof Prisma.PrismaClientKnownRequestError) {
      if(err.code === 'P2002'){
        return {status: 409, title: 'Conflict', detail: 'Data alredy exists'}
      }
      if(err.code === 'P2025'){
        return {status: 404, title: 'Resource not found', detail: 'Data does not exist'}
      }
    }

    const httpError = err as {type?: string, status?: number}
    if(httpError?.type === 'entity.parse.failed'){
      return {status: 400, title: 'Invalid JSON', detail: 'The bodi cointains invalid JSON data'}
    }
    if(httpError?.type === 'entity.too.large'){
      return {status: 413, title: 'Body too long'}
    }

    this.logger.error({err, path: req.path}, 'Uncontrolled error');
    return {status: 500, title: 'Internal server error'}
  }

  private send(res: Response, problem: Problem) {
    if(res.headersSent) return
    res.status(problem.status).type('application/problem+json').json(problem)
  }
}
