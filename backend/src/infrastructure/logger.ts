// Qué es: el logger estructurado (pino). En desarrollo se ve legible con pino-pretty; en
// producción escribe JSON, que es lo que esperan Loki, CloudWatch, Datadog...
// Conexión: container.ts lo crea y lo pasa a los servicios que registran actividad.
import { pino, type Logger } from 'pino'

export type { Logger }

export function createLogger(production: boolean): Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? 'info',
    // Nunca escribir secretos en los logs
    redact: ['req.headers.authorization', 'req.headers["x-api-key"]', 'req.headers.cookie'],
    ...(production
      ? {}
      : { transport: { target: 'pino-pretty', options: { singleLine: true, translateTime: 'HH:MM:ss' } } }),
  })
}
