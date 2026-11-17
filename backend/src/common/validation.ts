import { z } from 'zod'
import { ValidationError } from '../domain/error.js' 

z.config(z.locales.en())

export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data)
  if(result.success) return result.data
  const errors: Record<string, string[]> ={}
  for(const issue of result.error.issues){
    const key = issue.path.map(String).join('.') || '_';
    (errors[key] ??= []).push(issue.message)
  }
  throw new ValidationError(errors)
}

export const queryBool = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true')

export const pagination = (defaultSize: number, maxSize: number) => ({
  page: z.coerce.number().int().catch(1).transform((n) => Math.max(1, n)),
  pageSize: z.coerce.number().int().catch(defaultSize)
    .transform(n => Math.min(Math.max(1, n), maxSize)),
})

export const uuidParam = z.object({id: z.uuid('Invalid identifier')})

export const emailField = z.string().trim().toLowerCase().pipe(z.email('Invalid email').max(256))

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export const paged = <T>(
  items: T[], page: number, pageSize: number, totalCount: number
): PagedResult<T> => ({
  items, page, pageSize, totalCount
})
