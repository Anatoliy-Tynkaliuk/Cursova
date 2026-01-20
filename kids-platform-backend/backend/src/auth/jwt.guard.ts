import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header");
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization format");
    }

    try {
      const payload = await this.jwt.verifyAsync(token);
      req.user = payload; // 👈 ОЦЕ ГОЛОВНЕ
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
