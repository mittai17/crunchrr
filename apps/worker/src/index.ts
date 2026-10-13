import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), "../../.env"), quiet: true });
config({ quiet: true });
import { Queue, Worker } from "bullmq";
import {
  createDatabase,
  entities,
  notifications,
  users,
} from "@crunchrr/database";
import { eq, and, lte, inArray, notInArray, sql } from "drizzle-orm";
import { nextOccurrence } from "@crunchrr/utils";
const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
};
const { db, pool } = createDatabase();
const queue = new Queue("crunchrr-reminders", { connection });
await queue.upsertJobScheduler(
  "due-records",
  { every: 60000 },
  {
    name: "scan-due",
    data: {},
    opts: {
      removeOnComplete: 100,
      removeOnFail: 100,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    },
  },
);
const worker = new Worker(
  "crunchrr-reminders",
  async () => {
    const now = new Date();
    const due = await db
      .select({ entity: entities, profile: users.profile })
      .from(entities)
      .innerJoin(users, eq(users.id, entities.ownerId))
      .where(
        and(
          lte(entities.dueAt, now),
          inArray(entities.kind, [
            "task",
            "event",
            "reminder",
            "medicine",
            "habit",
            "goal",
            "bill",
            "subscription",
            "document",
            "order",
            "vehicle",
          ]),
          notInArray(entities.status, [
            "completed",
            "cancelled",
            "delivered",
            "taken",
            "skipped",
          ]),
          sql`${users.profile}->>'notifications' = 'true'`,
          sql`NOT EXISTS (SELECT 1 FROM notifications n WHERE n.entity_id = ${entities.id} AND n.created_at >= ${entities.dueAt})`,
        ),
      )
      .limit(500);
    for (const { entity: e, profile } of due) {
      if (!profile.notifications) continue;
      await db.transaction(async (tx) => {
        await tx
          .insert(notifications)
          .values({
            ownerId: e.ownerId,
            entityId: e.id,
            title: `${e.title} is due`,
            dedupeKey: `${e.id}:${e.dueAt?.toISOString()}`,
          })
          .onConflictDoNothing();
        if (
          e.dueAt &&
          e.recurrence !== "none" &&
          [
            "reminder",
            "bill",
            "subscription",
            "habit",
            "medicine",
            "event",
          ].includes(e.kind)
        ) {
          const next = nextOccurrence(e.dueAt, e.recurrence);
          if (next) {
            const data =
              e.kind === "event"
                ? {
                    ...e.data,
                    start: next.toISOString(),
                    end: new Date(
                      next.getTime() +
                        Math.max(
                          0,
                          new Date(String(e.data.end)).getTime() -
                            new Date(String(e.data.start)).getTime(),
                        ),
                    ).toISOString(),
                  }
                : e.data;
            await tx
              .update(entities)
              .set({
                dueAt: next,
                data,
                version: sql`${entities.version}+1`,
                updatedAt: now,
              })
              .where(
                and(eq(entities.id, e.id), eq(entities.version, e.version)),
              );
          }
        }
      });
    }
  },
  { connection, concurrency: 1 },
);
worker.on("failed", (job, error) =>
  console.error(
    JSON.stringify({ level: "error", job: job?.id, message: error.message }),
  ),
);
async function stop() {
  await worker.close();
  await queue.close();
  await pool.end();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
console.log("crunchrr reminder worker ready");
