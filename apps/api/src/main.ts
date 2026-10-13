import "reflect-metadata";
import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), "../../.env"), quiet: true });
config({ quiet: true });
import { NestFactory } from "@nestjs/core";
import {
  Module,
  Catch,
  HttpException,
  Logger,
  type ExceptionFilter,
  type ArgumentsHost,
} from "@nestjs/common";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import helmet from "@fastify/helmet";
import type { FastifyReply } from "fastify";
import { ZodError } from "zod";
import { Repository } from "./repository";
import { ApiController } from "./controller";
import { AuthGuard } from "./auth";
import { AssistantService } from "./assistant";
@Catch()
class SafeErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status =
      error instanceof ZodError
        ? 400
        : error instanceof HttpException
          ? error.getStatus()
          : 500;
    const message =
      error instanceof ZodError
        ? error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")
        : error instanceof HttpException
          ? error.message
          : "Something went wrong. Please try again.";
    if (status >= 500)
      Logger.error(error instanceof Error ? error.stack : error, "API");
    reply.code(status).send({ message, statusCode: status });
  }
}
@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: "default", ttl: 60000, limit: 120 }]),
  ],
  controllers: [ApiController],
  providers: [
    Repository,
    AuthGuard,
    AssistantService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
class AppModule {}
if (process.env.DEMO_MODE === "true" && process.env.NODE_ENV === "production")
  throw new Error("Demo mode must never run in production");
if (!process.env.DATABASE_URL || !process.env.CLERK_SECRET_KEY)
  throw new Error("Neon and Clerk configuration is required");
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({ logger: true, bodyLimit: 1024 * 1024 }),
);
await app.register(helmet, { contentSecurityPolicy: false });
app.enableCors({
  origin: (process.env.WEB_ORIGIN || "http://localhost:3000").split(","),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    ...(process.env.DEMO_MODE === "true" ? ["X-Crunchrr-Demo"] : []),
  ],
  credentials: false,
});
app.useGlobalFilters(new SafeErrors());
app.enableShutdownHooks();
await app.listen(
  Number(process.env.PORT || 4000),
  process.env.DEMO_MODE === "true" ? "127.0.0.1" : "0.0.0.0",
);
