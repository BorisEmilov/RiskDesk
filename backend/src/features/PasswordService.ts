import bcrypt from 'bcryptjs'
import { ok } from 'node:assert'

export class PasswordService {
  private static readonly COST =11
  private static readonly DUMMY_HASH = bcrypt.hashSync('dummy-pass', PasswordService.COST)

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, PasswordService.COST)
  }

  verify(password: string, hash: string | null | undefined): Promise<boolean> {
    return bcrypt.compare(password, hash ?? PasswordService.DUMMY_HASH)
      .then(ok => ok && !!hash)
  }
}
