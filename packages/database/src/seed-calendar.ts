import { createDatabase, users, entities } from "./index";
import { and, eq, sql } from "drizzle-orm";
import { createEntitySchema } from "@crunchrr/validation";
if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE !== "true")
  throw new Error("Calendar seed requires explicit development demo mode");
const { db, pool } = createDatabase();
try {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, "demo_crunchrr"));
  if (!user) throw new Error("Run the base demo seed first");
  const existing = await db
    .select({ id: entities.id })
    .from(entities)
    .where(
      and(
        eq(entities.ownerId, user.id),
        sql`${entities.tags} @> '["calendar-reference-demo"]'::jsonb`,
      ),
    )
    .limit(1);
  if (!existing.length) {
    const people = await db
      .select()
      .from(entities)
      .where(and(eq(entities.ownerId, user.id), eq(entities.kind, "person")));
    const participants = people
      .filter((p) => ["Alicia", "Mark", "James"].includes(p.title))
      .map((p) => p.id);
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const samples: [string, number, number, number, string, string][] = [
      ["Email design", 0, 9, 2, "personal", "Design studio"],
      ["UX meeting", 0, 11.5, 1, "work", "Google Meet"],
      ["Develop meeting", 0, 12.5, 1.5, "work", "Project room"],
      ["YouTube video", 1, 8.5, 1.5, "work", "Content studio"],
      ["Designers meeting", 1, 10, 1, "education", "Learning space"],
      ["Brainstorm", 1, 11, 2, "personal", "Creative room"],
      ["Morning focus", 2, 8, 1, "education", "Home office"],
      ["Breakfast", 2, 9.5, 1, "education", "Kitchen"],
      ["Team meeting", 2, 11, 1.5, "work", "Google Meet"],
      ["Landing page", 3, 8, 1, "personal", "Project room"],
      ["Responsive Design", 3, 9, 1, "work", "Design studio"],
      ["Lunch time", 3, 11, 1, "education", "Café"],
      ["Designers meet", 3, 12.5, 2, "personal", "Creative room"],
      ["Study time", 4, 8, 1.5, "work", "Library"],
      ["Motion design", 4, 9.5, 1, "education", "Design studio"],
      ["New Project", 4, 10.5, 2, "personal", "Project room"],
      ["UX meeting", 5, 11.5, 2, "work", "Google Meet"],
      ["Family brunch", 6, 10, 2, "personal", "Home"],
    ];
    await db.transaction(async (tx) => {
      for (const [
        title,
        offset,
        hour,
        duration,
        category,
        location,
      ] of samples) {
        const start = new Date(monday);
        start.setDate(start.getDate() + offset);
        start.setMinutes(hour * 60);
        const end = new Date(start.getTime() + duration * 3600000);
        const value = createEntitySchema.parse({
          kind: "event",
          title,
          description: "Synthetic calendar reference event.",
          status: "scheduled",
          tags: ["calendar-reference-demo", `category:${category}`],
          dueAt: start.toISOString(),
          data: {
            start: start.toISOString(),
            end: end.toISOString(),
            location,
            participants: /meeting|design/i.test(title) ? participants : [],
          },
        });
        await tx
          .insert(entities)
          .values({
            ...value,
            ownerId: user.id,
            dueAt: new Date(value.dueAt!),
            data: value.data,
          });
      }
    });
    console.log(`Created ${samples.length} synthetic calendar events`);
  } else console.log("Synthetic calendar events already exist");
} finally {
  await pool.end();
}
