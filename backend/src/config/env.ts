// Qué es: la configuración de la aplicación leída de variables de entorno y validada con zod.
// Conexión: container.ts la carga una vez al arrancar y la reparte a los servicios que la necesitan.
// Si falta algo obligatorio (o es inválido), el proceso no arranca y dice exactamente qué falla.
import { z } from 'zod'
import { SEVERITIES } from '../domain/enums.js'

const bool = z.enum(['true', 'false', '1', '0']).transform((v) => v === 'true' || v === '1')

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5080),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RUN_WORKERS: bool.default(true),
  SEED_DEMO: bool.default(false),

  DATABASE_URL: z.string().min(1, 'Falta DATABASE_URL'),
  REDIS_URL: z.string().default('redis://localhost:6383'),

  JWT_ISSUER: z.string().default('riskdesk-api'),
  JWT_AUDIENCE: z.string().default('riskdesk'),
  JWT_SIGNING_KEY: z.string().min(32, 'JWT_SIGNING_KEY debe tener al menos 32 caracteres'),
  ACCESS_TOKEN_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(7),

  AI_ENABLED: bool.default(false),
  AI_PROVIDER_NAME: z.string().default('groq'),
  AI_BASE_URL: z.url().default('https://api.groq.com/openai/v1'),
  AI_API_KEY: z.string().default(''),
  AI_MODEL: z.string().default('llama-3.3-70b-versatile'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(20_000),
  AI_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(20),
  AI_JSON_MODE: bool.default(true),
  AI_TRIAGE_MIN_SEVERITY: z.enum(SEVERITIES).default('Medium'),
  AI_PSEUDONYMIZATION_SECRET: z.string().min(16, 'AI_PSEUDONYMIZATION_SECRET: mínimo 16 caracteres'),

  SEED_ADMIN_EMAIL: z.string().default('admin@riskdesk.dev'),
  SEED_ADMIN_PASSWORD: z.string().default('Demo1234!'),
  SEED_ANALYST_EMAIL: z.string().default('analista@riskdesk.dev'),
  SEED_ANALYST_PASSWORD: z.string().default('Analista1234!'),
  SEED_API_KEY: z.string().default('rd_sk_demo000000000000000000000000000000000000000000'),
})

export type Env = z.infer<typeof EnvSchema>

export class AppConfig {
  private constructor(readonly env: Env) {}

  static load(source: NodeJS.ProcessEnv = process.env): AppConfig {
    const result = EnvSchema.safeParse(source)
    if (!result.success) {
      const lines = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      throw new Error(`Configuración inválida:\n${lines.join('\n')}`)
    }
    return new AppConfig(result.data)
  }

  get isProduction() {
    return this.env.NODE_ENV === 'production'
  }

  /** La IA solo se activa si está habilitada Y hay clave (o la URL es local, como Ollama). */
  get aiActive() {
    const local = /localhost|127\.0\.0\.1|host\.docker\.internal/.test(this.env.AI_BASE_URL)
    return this.env.AI_ENABLED && (this.env.AI_API_KEY.length > 0 || local)
  }
}
