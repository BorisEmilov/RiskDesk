import { createHash, randomBytes } from 'node:crypto'
import type { Redis } from 'ioredis'
import type { Database } from '../../infrastructure/database.js'
import type { Logger } from '../../infrastructure/logger.js'

export class ApiKeyService {
  private static readonly TTL_SECONDS = 5 * 60
  private static readonly cacheKey = (hash: string) => `rd:apikey:${hash}`
  
  constructor(
    private readonly db: Database,
    private readonly redis: Redis,
    private readonly logger: Logger
  ){}

  static generate(): string {
    return `rd_sk_${randomBytes(24).toString('hex')}`
  }

  static hash(key: string): string {
    return createHash('sha256').update(key, 'utf8').digest('hex')
  }

  static prefix(key: string): string {
    return key.slice(0, 12)
  }



  async resolve(apiKey: string): Promise<string | null> {
    const hash = ApiKeyService.hash(apiKey);
    try {
      const cached = await this.redis.get(ApiKeyService.cacheKey(hash));
      if(cached) return cached;
    } catch (err) {
      this.logger.warn({err}, 'Redis search error')
    }

    const op = await this.db.client.operator.findUnique({
      where: {apiKeyHash: hash}, select: {id: true}
    });
    if(!op) return null;

    try {
      await this.redis.set(ApiKeyService.cacheKey(hash),op.id, 'EX', ApiKeyService.TTL_SECONDS);
    } catch (err) {
      this.logger.warn({err}, 'Error uploading key to redis')
    }
    return op.id;
  }

  async invalidate(hash: string | null) {
    if(!hash) return;
    try {
      await this.redis.del(ApiKeyService.cacheKey(hash))
    } catch (err) {
      this.logger.warn({err}, 'Error invalidationg api key')
    }
  }
}
