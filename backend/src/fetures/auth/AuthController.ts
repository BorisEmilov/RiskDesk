import { type CookieOptions, type Request, type Response, Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { parse } from '../../common/validation.js'
import { UnauthorizedError } from '../../domain/error.js' 
import { type AuthResponse, type AuthService, type IssuedSession, LoginSchema, RegistrationSchema } from './AuthService.js'

export class AuthController {
  static readonly COOKIE = 'rd_rt';

  constructor(
    private readonly auth: AuthService,
    private readonly secureCookies: boolean
  ){}

  router(): Router {
    const limiter = rateLimit({
      windowMs: 60_000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        status: 429,
        title: 'Too many requests',
        detail: 'Too many attempts. Wait 1 min'
      }
    });
    const r = Router();
    r.post('/register', limiter, this.register);
    r.post('/login', limiter, this.login);
    r.post('/refresh', this.refresh);
    r.post('/logout', this.logout);
    return r;
  }

  async register(req: Request, res: Response) {
    const input = parse(RegistrationSchema, req.body);
    const result = await this.auth.register(input);
    this.setCookie(res, result);
    res.status(201).json({...result.response, apiKey: result.apiKey});
  }

  async login(req: Request, res: Response) {
    const {email, password} = parse(LoginSchema, req.body);
    const result = await this.auth.login(email, password);
    if(!result) throw new UnauthorizedError('Wrong Email or password');
    this.setCookie(res, result);
    res.json(result.response)
  }

  async refresh(req: Request, res: Response) {
    const token = this.readCookie(req);
    const result = token ? await this.auth.refresh(token) : null;
    if(!result){
      res.clearCookie(AuthController.COOKIE, this.options())
      throw new UnauthorizedError('Session expired')
    }
    this.setCookie(res, result);
    res.json(result.response)
  }

  async logout(req: Request, res: Response) {
    const token = this.readCookie(req);
    if(token) await this.auth.logout(token);
    res.clearCookie(AuthController.COOKIE, this.options());
    res.status(204).end();
  }


  private readCookie(req: Request): string | undefined {
    const value: unknown = req.cookies?.[AuthController.COOKIE];
    return typeof value === 'string' && value.length > 0 ? value : undefined
  }

  private options(expires?: Date): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'strict',
      path: '/api/auth',
      ...(expires ? {expires} : {})
    }
  }

  private setCookie(res: Response, result: IssuedSession) {
    res.cookie(AuthController.COOKIE, result.refreshToken, this.options(result.refreshExpiresAt))
  }
}
