export abstract class AppError extends Error {
    abstract readonly status: number
    abstract readonly title: string
}

export class DomainError extends AppError {
    override readonly status = 422
    override readonly title = 'Domain exception'
}

export class NotFoundError extends AppError {
    override readonly status = 404
    override readonly title = 'Not Found'
}

export class ConflictError extends AppError {
    override readonly status = 409
    override readonly title = 'Conflict Error'
}

export class ForbiddenError extends AppError {
    override readonly status = 403
    override readonly title = 'Forbidden Action'
}

export class UnauthorizedError extends AppError {
    override readonly status = 401
    override readonly title = 'Invalid Data'
}

export class ValidationError extends AppError {
    override readonly status = 400
    override readonly title = 'Invalid Data'
    constructor(readonly errors: Record<string, string[]>){
        super('Review the input data')
    }
}