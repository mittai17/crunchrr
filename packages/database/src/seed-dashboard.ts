import { createDatabase, users, entities } from "./index";
import { and, eq, sql } from "drizzle-orm";
import { createEntitySchema } from "@crunchrr/validation";
if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE !== "true")
  throw new Error(
    "Dashboard seed is only allowed in explicit development demo mode",
  );
const { db, pool } = createDatabase();
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, "demo_crunchrr"));
if (!user) throw new Error("Run the base demo seed first");
await db
  .update(users)
  .set({ profile: { ...user.profile, name: "Thomas" } })
  .where(eq(users.id, user.id));
const existing = await db
  .select({ id: entities.id })
  .from(entities)
  .where(
    and(
      eq(entities.ownerId, user.id),
      sql`${entities.tags} @> '["reference-demo"]'::jsonb`,
    ),
  )
  .limit(1);
if (!existing.length) {
  const now = new Date();
  const week = new Date(now);
  week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
  week.setHours(12, 0, 0, 0);
  const prev = new Date(week);
  prev.setDate(prev.getDate() - 7);
  const workLastWeek = [4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2];
  await db.transaction(async (tx) => {
    async function create(value: unknown) {
      const p = createEntitySchema.parse(value);
      const [e] = await tx
        .insert(entities)
        .values({
          ...p,
          ownerId: user.id,
          data: p.data as Record<string, unknown>,
          dueAt: p.dueAt ? new Date(p.dueAt) : null,
        })
        .returning();
      return e;
    }
    for (let i = 0; i < workLastWeek.length; i++) {
      const date = new Date(prev);
      date.setDate(date.getDate() + (i % 7));
      await create({
        kind: "task",
        title: `Work session ${i + 1}`,
        status: "completed",
        dueAt: date.toISOString(),
        tags: ["reference-demo"],
        data: {
          trackedMinutes: workLastWeek[i]! * 60,
          trackedAt: date.toISOString(),
          completedAt: date.toISOString(),
        },
      });
    }
    for (const [i, hours] of [4, 6, 8, 2, 5, 2, 1].entries()) {
      const date = new Date(week);
      date.setDate(date.getDate() + i);
      await create({
        kind: "task",
        title: [
          "Design exploration",
          "Research sprint",
          "Build the dashboard",
          "Team planning",
          "Polish interactions",
          "Personal learning",
          "Weekly review",
        ][i],
        dueAt: date.toISOString(),
        status: "in_progress",
        tags: ["reference-demo"],
        data: {
          trackedMinutes: hours * 60,
          trackedAt: date.toISOString(),
          estimatedMinutes: hours * 60,
        },
      });
    }
    for (const [offset, total, completed] of [
      [3, 13, 8],
      [2, 9, 8],
      [1, 14, 3],
    ]) {
      const month = new Date(
        now.getFullYear(),
        now.getMonth() - offset!,
        15,
        12,
      );
      for (let i = 0; i < total!; i++)
        await create({
          kind: "task",
          title: `${month.toLocaleString("en", { month: "long" })} archived task ${i + 1}`,
          status: i < completed! ? "completed" : "todo",
          dueAt: month.toISOString(),
          tags: ["reference-demo", "archive"],
          data: i < completed! ? { completedAt: month.toISOString() } : {},
        });
    }
    for (const [title, description, status, progress, durationMinutes, day] of [
      ["Design", "UI improvements for dashboard", "in_progress", 43, 720, 28],
      ["Research", "AI assistant brainstorming", "completed", 100, 360, 27],
      ["Personal", "Ideas for new features", "in_progress", 0, 240, 26],
    ] as const) {
      await create({
        kind: "note",
        title,
        description,
        status,
        tags: ["reference-demo"],
        dueAt: new Date(2023, 4, day, 12).toISOString(),
        data: {
          content: `# ${title}\n\n${description}`,
          format: "markdown",
          progress,
          durationMinutes,
        },
      });
    }
    for (const [title, progress, avatarUrl] of [
      [
        "Alicia",
        72,
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
      ],
      [
        "Mark",
        49,
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      ],
      [
        "James",
        86,
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
      ],
    ] as const)
      await create({
        kind: "person",
        title,
        tags: ["reference-demo"],
        data: {
          relationship: "Teammate",
          progress,
          avatarUrl,
          displayOrder: ["Alicia", "Mark", "James"].indexOf(title),
        },
      });
  });
  console.log("Created the new reference dashboard synthetic dataset");
} else console.log("Reference dashboard records already exist");
await pool.end();
