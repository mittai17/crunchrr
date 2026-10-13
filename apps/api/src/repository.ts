import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import {
  createDatabase,
  entities,
  entityLinks,
  users,
  auditLogs,
  notifications,
  files,
  type Database,
} from "@crunchrr/database";
import { and, eq, or, desc, sql, count } from "drizzle-orm";
import {
  createEntitySchema,
  type CreateEntity,
  type Entity,
  type EntityKind,
  type Profile,
  updateEntitySchema,
} from "@crunchrr/validation";
import type { z } from "zod";
export const defaultProfile: Profile = {
  name: "Friend",
  timezone: "Asia/Kolkata",
  currency: "INR",
  theme: "system",
  aiPermissions: [],
  widgets: [],
  onboarded: false,
  notifications: true,
};
export function serialize(row: typeof entities.$inferSelect): Entity {
  return {
    ...row,
    status: row.status as Entity["status"],
    priority: row.priority as Entity["priority"],
    recurrence: row.recurrence as Entity["recurrence"],
    dueAt: row.dueAt?.toISOString() || null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
@Injectable()
export class Repository {
  readonly db: Database;
  readonly pool: ReturnType<typeof createDatabase>["pool"];
  constructor() {
    const connection = createDatabase();
    this.db = connection.db;
    this.pool = connection.pool;
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
  async user(clerkId: string) {
    await this.db
      .insert(users)
      .values({ clerkId, profile: defaultProfile })
      .onConflictDoNothing();
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    if (!user) throw new NotFoundException("Account unavailable");
    return user;
  }
  async owned(ownerId: string, id: string) {
    const [row] = await this.db
      .select()
      .from(entities)
      .where(and(eq(entities.ownerId, ownerId), eq(entities.id, id)));
    if (!row) throw new NotFoundException("Record not found");
    return serialize(row);
  }
  async list(
    ownerId: string,
    kind: EntityKind | undefined,
    q: string | undefined,
    page: number,
    limit: number,
  ) {
    const filter = and(
      eq(entities.ownerId, ownerId),
      kind ? eq(entities.kind, kind) : undefined,
      q
        ? or(
            sql`search_vector @@ websearch_to_tsquery('english', ${q})`,
            sql`${entities.title} ILIKE ${"%" + q.replace(/[\\%_]/g, "\\$&") + "%"}`,
          )
        : undefined,
    );
    const [items, total] = await Promise.all([
      this.db
        .select()
        .from(entities)
        .where(filter)
        .orderBy(desc(entities.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ value: count() }).from(entities).where(filter),
    ]);
    return { items: items.map(serialize), total: total[0]?.value || 0 };
  }
  async fileOwned(ownerId: string, id: string) {
    const [file] = await this.db
      .select()
      .from(files)
      .where(and(eq(files.ownerId, ownerId), eq(files.id, id)));
    if (!file) throw new NotFoundException("File not found");
    return file;
  }
  async validateReferences(ownerId: string, data: Record<string, unknown>) {
    if (typeof data.fileId === "string")
      await this.fileOwned(ownerId, data.fileId);
    if (typeof data.accountId === "string") {
      const e = await this.owned(ownerId, data.accountId);
      if (e.kind !== "account")
        throw new BadRequestException("Invalid account");
    }
    if (Array.isArray(data.participants))
      for (const id of data.participants) {
        const e = await this.owned(ownerId, String(id));
        if (e.kind !== "person")
          throw new BadRequestException("Invalid participant");
      }
  }
  async create(ownerId: string, value: CreateEntity) {
    await this.validateReferences(
      ownerId,
      value.data as Record<string, unknown>,
    );
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(entities)
        .values({
          ...value,
          ownerId,
          data: value.data as Record<string, unknown>,
          dueAt: value.dueAt ? new Date(value.dueAt) : null,
        })
        .returning();
      if (!row) throw new ConflictException("Record could not be created");
      await tx.insert(auditLogs).values({
        ownerId,
        entityId: row.id,
        action: "entity.create",
        metadata: { kind: row.kind },
      });
      return serialize(row);
    });
  }
  async update(
    ownerId: string,
    id: string,
    value: z.infer<typeof updateEntitySchema>,
  ) {
    const current = await this.owned(ownerId, id);
    const next = createEntitySchema.parse({
      ...current,
      ...value.changes,
      data: { ...current.data, ...value.changes.data },
    });
    await this.validateReferences(
      ownerId,
      next.data as Record<string, unknown>,
    );
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .update(entities)
        .set({
          ...next,
          data: next.data as Record<string, unknown>,
          dueAt: next.dueAt ? new Date(next.dueAt) : null,
          version: sql`${entities.version}+1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(entities.ownerId, ownerId),
            eq(entities.id, id),
            eq(entities.version, value.version),
          ),
        )
        .returning();
      if (!row)
        throw new ConflictException(
          "This record changed. Refresh before saving.",
        );
      await tx.insert(auditLogs).values({
        ownerId,
        entityId: id,
        action: "entity.update",
        metadata: { kind: row.kind, fields: Object.keys(value.changes) },
      });
      return serialize(row);
    });
  }
  async remove(ownerId: string, id: string) {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .delete(entities)
        .where(and(eq(entities.ownerId, ownerId), eq(entities.id, id)))
        .returning({ id: entities.id });
      if (!row) throw new NotFoundException("Record not found");
      await tx
        .insert(auditLogs)
        .values({ ownerId, entityId: id, action: "entity.delete" });
    });
  }
  async links(ownerId: string, id: string) {
    await this.owned(ownerId, id);
    const rows = await this.db
      .select()
      .from(entityLinks)
      .where(
        and(
          eq(entityLinks.ownerId, ownerId),
          or(eq(entityLinks.sourceId, id), eq(entityLinks.targetId, id)),
        ),
      );
    return Promise.all(
      rows.map(async (link) => ({
        ...link,
        createdAt: link.createdAt.toISOString(),
        entity: await this.owned(
          ownerId,
          link.sourceId === id ? link.targetId : link.sourceId,
        ),
      })),
    );
  }
  async link(
    ownerId: string,
    value: { sourceId: string; targetId: string; relationship: string },
  ) {
    await Promise.all([
      this.owned(ownerId, value.sourceId),
      this.owned(ownerId, value.targetId),
    ]);
    return this.db.transaction(async (tx) => {
      const [link] = await tx
        .insert(entityLinks)
        .values({ ...value, ownerId })
        .onConflictDoNothing()
        .returning();
      if (!link)
        throw new ConflictException("These records are already linked");
      await tx.insert(auditLogs).values({
        ownerId,
        entityId: value.sourceId,
        action: "link.create",
        metadata: { targetId: value.targetId },
      });
      return {
        ...link,
        createdAt: link.createdAt.toISOString(),
        entity: await this.owned(ownerId, value.targetId),
      };
    });
  }
  async summary(ownerId: string, timezone: string) {
    const result = await this.pool.query<{
      kind: string;
      total: number;
      completed: number;
      amount: string;
    }>(
      `SELECT kind,count(*)::int AS total,count(*) FILTER(WHERE status IN ('completed','taken','delivered'))::int AS completed,coalesce(sum(CASE WHEN kind IN ('expense','income') THEN (data->>'amount')::numeric ELSE 0 END),0)::text AS amount FROM entities WHERE owner_id=$1 AND (kind IN ('goal','medicine','habit','project','document') OR (coalesce(due_at,created_at) AT TIME ZONE $2)::date=(now() AT TIME ZONE $2)::date) GROUP BY kind`,
      [ownerId, timezone],
    );
    const finance = await this.pool.query<{
      kind: string;
      category: string;
      amount: string;
    }>(
      `SELECT kind,coalesce(data->>'category','Other') AS category,sum((data->>'amount')::numeric)::text AS amount FROM entities WHERE owner_id=$1 AND kind IN ('expense','income') AND date_trunc('month',coalesce(due_at,created_at) AT TIME ZONE $2)=date_trunc('month',now() AT TIME ZONE $2) GROUP BY kind,category`,
      [ownerId, timezone],
    );
    const weekly = await this.pool.query<{
      minutes: string;
      completed: number;
    }>(
      `SELECT coalesce(sum((data->>'trackedMinutes')::numeric) FILTER (WHERE (coalesce((data->>'trackedAt')::timestamptz,due_at,created_at) AT TIME ZONE $2) >= date_trunc('week',now() AT TIME ZONE $2)-interval '1 week' AND (coalesce((data->>'trackedAt')::timestamptz,due_at,created_at) AT TIME ZONE $2) < date_trunc('week',now() AT TIME ZONE $2)),0)::text AS minutes,count(*) FILTER(WHERE status='completed' AND (coalesce((data->>'completedAt')::timestamptz,updated_at) AT TIME ZONE $2) >= date_trunc('week',now() AT TIME ZONE $2)-interval '1 week' AND (coalesce((data->>'completedAt')::timestamptz,updated_at) AT TIME ZONE $2) < date_trunc('week',now() AT TIME ZONE $2))::int AS completed FROM entities WHERE owner_id=$1 AND kind='task'`,
      [ownerId, timezone],
    );
    const daily = await this.pool.query<{
      label: string;
      date: string;
      minutes: string;
    }>(
      `WITH days AS (SELECT generate_series(date_trunc('week',now() AT TIME ZONE $2),date_trunc('week',now() AT TIME ZONE $2)+interval '6 days',interval '1 day')::date AS day) SELECT to_char(days.day,'Dy') AS label,to_char(days.day,'YYYY-MM-DD') AS date,coalesce(sum((e.data->>'trackedMinutes')::numeric),0)::text AS minutes FROM days LEFT JOIN entities e ON e.owner_id=$1 AND e.kind='task' AND (coalesce((e.data->>'trackedAt')::timestamptz,e.due_at,e.created_at) AT TIME ZONE $2)::date=days.day GROUP BY days.day ORDER BY days.day`,
      [ownerId, timezone],
    );
    const monthly = await this.pool.query<{
      label: string;
      total: number;
      completed: number;
    }>(
      `WITH months AS(SELECT generate_series(date_trunc('month',now() AT TIME ZONE $2)-interval '3 months',date_trunc('month',now() AT TIME ZONE $2)-interval '1 month',interval '1 month') AS month) SELECT to_char(months.month,'FMMonth') AS label,count(e.id)::int AS total,count(e.id) FILTER(WHERE e.status='completed')::int AS completed FROM months LEFT JOIN entities e ON e.owner_id=$1 AND e.kind='task' AND date_trunc('month',coalesce(e.due_at,e.created_at) AT TIME ZONE $2)=months.month GROUP BY months.month ORDER BY months.month`,
      [ownerId, timezone],
    );
    return {
      today: result.rows,
      finance: finance.rows,
      analytics: {
        hoursLastWeek: Number(weekly.rows[0]?.minutes || 0) / 60,
        completedLastWeek: weekly.rows[0]?.completed || 0,
        daily: daily.rows.map((d) => ({ ...d, minutes: Number(d.minutes) })),
        monthly: monthly.rows.map((m) => ({
          ...m,
          percentage: m.total ? Math.round((m.completed / m.total) * 100) : 0,
        })),
      },
    };
  }
}
