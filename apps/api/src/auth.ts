import {
  Injectable,
  Inject,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
  createParamDecorator,
} from "@nestjs/common";
import { verifyToken } from "@clerk/backend";
import type { FastifyRequest } from "fastify";
import { Repository } from "./repository";
export interface AuthRequest extends FastifyRequest {
  owner: {
    id: string;
    clerkId: string;
    profile: import("@crunchrr/validation").Profile;
  };
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Repository) private readonly repository: Repository) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    let clerkId: string;
    const demo =
      process.env.DEMO_MODE === "true" && process.env.NODE_ENV !== "production";
    if (
      demo &&
      req.headers["x-crunchrr-demo"] === "true" &&
      ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.ip)
    ) {
      clerkId = "demo_crunchrr";
    } else {
      const token = req.headers.authorization?.replace(/^Bearer /, "");
      if (!token || !process.env.CLERK_SECRET_KEY)
        throw new UnauthorizedException("Sign in to continue");
      try {
        const claims = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        const parties = (
          process.env.CLERK_AUTHORIZED_PARTIES ||
          process.env.WEB_ORIGIN ||
          "http://localhost:3000"
        ).split(",");
        if (claims.azp && !parties.includes(claims.azp))
          throw new UnauthorizedException("Invalid session origin");
        clerkId = claims.sub;
      } catch {
        throw new UnauthorizedException("Your session expired. Sign in again.");
      }
    }
    req.owner = await this.repository.user(clerkId);
    return true;
  }
}
export const Owner = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<AuthRequest>().owner,
);
