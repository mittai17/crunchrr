import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Inject,
  HttpCode,
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  createEntitySchema,
  updateEntitySchema,
  linkSchema,
  profileSchema,
  aiRequestSchema,
  uploadSchema,
  kindSchema,
  type Profile,
} from "@crunchrr/validation";
import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import {
  users,
  entityLinks,
  entities,
  notifications,
  files,
  auditLogs,
} from "@crunchrr/database";
import { createClerkClient } from "@clerk/backend";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { Repository, serialize } from "./repository";
import { Owner, AuthGuard } from "./auth";
import { AssistantService } from "./assistant";
type User = { id: string; clerkId: string; profile: Profile };
const id = (v: string) => z.uuid().parse(v);
function storage() {
  if (
    !process.env.S3_BUCKET ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY
  )
    throw new ServiceUnavailableException("File storage is not connected yet.");
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
}
@Controller("api/v1")
@UseGuards(AuthGuard)
export class ApiController {
  constructor(
    @Inject(Repository) private readonly repository: Repository,
    @Inject(AssistantService)
    private readonly assistantService: AssistantService,
  ) {}
  @Get("entities") list(
    @Owner() u: User,
    @Query() query: Record<string, string>,
  ) {
    const p = z
      .object({
        kind: kindSchema.optional(),
        q: z.string().max(200).optional(),
        page: z.coerce.number().int().min(1).max(10000).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .parse(query);
    return this.repository.list(u.id, p.kind, p.q, p.page, p.limit);
  }
  @Get("entities/:id") get(@Owner() u: User, @Param("id") value: string) {
    return this.repository.owned(u.id, id(value));
  }
  @Post("entities") create(@Owner() u: User, @Body() body: unknown) {
    return this.repository.create(u.id, createEntitySchema.parse(body));
  }
  @Patch("entities/:id") update(
    @Owner() u: User,
    @Param("id") value: string,
    @Body() body: unknown,
  ) {
    return this.repository.update(
      u.id,
      id(value),
      updateEntitySchema.parse(body),
    );
  }
  @Delete("entities/:id") @HttpCode(204) remove(
    @Owner() u: User,
    @Param("id") value: string,
  ) {
    return this.repository.remove(u.id, id(value));
  }
  @Get("entities/:id/links") links(
    @Owner() u: User,
    @Param("id") value: string,
  ) {
    return this.repository.links(u.id, id(value));
  }
  @Post("links") link(@Owner() u: User, @Body() body: unknown) {
    return this.repository.link(u.id, linkSchema.parse(body));
  }
  @Delete("links/:id") @HttpCode(204) async unlink(
    @Owner() u: User,
    @Param("id") value: string,
  ) {
    const rows = await this.repository.db
      .delete(entityLinks)
      .where(and(eq(entityLinks.ownerId, u.id), eq(entityLinks.id, id(value))))
      .returning();
    if (!rows.length) throw new BadRequestException("Link not found");
  }
  @Get("dashboard") summary(@Owner() u: User) {
    return this.repository.summary(u.id, u.profile.timezone);
  }
  @Get("profile") profile(@Owner() u: User) {
    return u.profile;
  }
  @Put("profile") async saveProfile(@Owner() u: User, @Body() body: unknown) {
    const profile = profileSchema.parse(body);
    await this.repository.db.transaction(async (tx) => {
      await tx.update(users).set({ profile }).where(eq(users.id, u.id));
      await tx
        .insert(auditLogs)
        .values({
          ownerId: u.id,
          action: "profile.update",
          metadata: { fields: Object.keys(profile) },
        });
    });
    return profile;
  }
  @Get("notifications") getNotifications(@Owner() u: User) {
    return this.repository.db
      .select()
      .from(notifications)
      .where(eq(notifications.ownerId, u.id))
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  }
  @Patch("notifications/:id/read") @HttpCode(204) async read(
    @Owner() u: User,
    @Param("id") value: string,
  ) {
    await this.repository.db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.ownerId, u.id), eq(notifications.id, id(value))),
      );
  }
  @Post("assistant")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  assistant(@Owner() u: User, @Body() body: unknown) {
    return this.assistantService.respond(
      u.id,
      u.profile,
      aiRequestSchema.parse(body).message,
    );
  }
  @Post("files") @Throttle({ default: { limit: 10, ttl: 60000 } }) async upload(
    @Owner() u: User,
    @Body() body: unknown,
  ) {
    const value = uploadSchema.parse(body);
    const client = storage();
    const fileId = randomUUID(),
      key = `${u.id}/${fileId}`;
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: value.contentType,
        ContentLength: value.size,
      }),
      { expiresIn: 120 },
    );
    await this.repository.db
      .insert(files)
      .values({ ...value, id: fileId, key, ownerId: u.id });
    return { id: fileId, url };
  }
  @Get("files/:id") async download(
    @Owner() u: User,
    @Param("id") value: string,
  ) {
    const file = await this.repository.fileOwned(u.id, id(value));
    return {
      url: await getSignedUrl(
        storage(),
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: file.key,
          ResponseContentDisposition: "attachment",
        }),
        { expiresIn: 120 },
      ),
    };
  }
  @Get("export") async export(@Owner() u: User) {
    const [records, links] = await Promise.all([
      this.repository.db
        .select()
        .from(entities)
        .where(eq(entities.ownerId, u.id)),
      this.repository.db
        .select()
        .from(entityLinks)
        .where(eq(entityLinks.ownerId, u.id)),
    ]);
    return { entities: records.map(serialize), links, profile: u.profile };
  }
  @Get("audit") audit(@Owner() u: User) {
    return this.repository.db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityId: auditLogs.entityId,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .where(eq(auditLogs.ownerId, u.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
  }
  @Delete("account") @HttpCode(204) async deleteAccount(
    @Owner() u: User,
    @Body() body: unknown,
  ) {
    z.object({ confirmation: z.literal("DELETE MY ACCOUNT") }).parse(body);
    const owned = await this.repository.db
      .select()
      .from(files)
      .where(eq(files.ownerId, u.id));
    if (owned.length) {
      const client = storage();
      for (let offset = 0; offset < owned.length; offset += 1000)
        await client.send(
          new DeleteObjectsCommand({
            Bucket: process.env.S3_BUCKET,
            Delete: {
              Objects: owned
                .slice(offset, offset + 1000)
                .map((f) => ({ Key: f.key })),
            },
          }),
        );
    }
    if (u.clerkId !== "demo_crunchrr")
      await createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      }).users.deleteUser(u.clerkId);
    await this.repository.db.delete(users).where(eq(users.id, u.id));
  }
}
