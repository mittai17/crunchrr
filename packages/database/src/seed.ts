import { createDatabase, users, entities, entityLinks } from "./index";
import { eq } from "drizzle-orm";
import { createEntitySchema, type EntityKind } from "@crunchrr/validation";
if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE !== "true")
  throw new Error(
    "Seed requires DEMO_MODE=true and non-production environment",
  );
const { db, pool } = createDatabase();
const now = new Date();
const at = (hour: number, minute = 0, days = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const key = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(now);
await db
  .insert(users)
  .values({
    clerkId: "demo_crunchrr",
    profile: {
      name: "Giridharan",
      timezone: "Asia/Kolkata",
      currency: "INR",
      theme: "light",
      aiPermissions: ["task", "event", "note", "goal", "habit", "project"],
      widgets: [],
      onboarded: true,
      notifications: true,
    },
  })
  .onConflictDoNothing();
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, "demo_crunchrr"));
if (!user) throw new Error("Seed user unavailable");
if (
  (
    await db
      .select({ id: entities.id })
      .from(entities)
      .where(eq(entities.ownerId, user.id))
      .limit(1)
  ).length
) {
  console.log("Demo records already exist");
} else {
  const records: {
    kind: EntityKind;
    title: string;
    data: Record<string, unknown>;
    dueAt?: string;
    status?: string;
    priority?: string;
    recurrence?: string;
    description?: string;
  }[] = [
    ...[
      "Complete DBMS assignment",
      "Read research paper",
      "Project meeting notes",
      "Gym workout",
      "Call home",
      "Plan next week",
      "Update expenses",
    ].map((title, i) => ({
      kind: "task" as const,
      title,
      data: {},
      dueAt: at(18, 0, i > 4 ? 1 : 0),
      status: [0, 4].includes(i) ? "completed" : "todo",
      priority: i === 1 ? "high" : i === 2 ? "medium" : "low",
    })),
    ...[
      {
        title: "College · DBMS Class",
        h: 9,
        m: 0,
        d: 60,
        location: "Main Block",
      },
      { title: "Gym", h: 11, m: 30, d: 90, location: "Fitness Center" },
      { title: "Project Meeting", h: 14, m: 0, d: 60, location: "Google Meet" },
      { title: "Study Time", h: 16, m: 0, d: 120, location: "Library" },
      { title: "Family Time", h: 19, m: 0, d: 120, location: "Home" },
    ].map((e) => ({
      kind: "event" as const,
      title: e.title,
      dueAt: at(e.h, e.m),
      data: {
        start: at(e.h, e.m),
        end: new Date(
          new Date(at(e.h, e.m)).getTime() + e.d * 60000,
        ).toISOString(),
        location: e.location,
        participants: [],
      },
      status: "scheduled",
    })),
    ...[
      { title: "Groceries", category: "Food", amount: 420 },
      { title: "Course materials", category: "Education", amount: 5000 },
      { title: "Metro pass", category: "Transport", amount: 2100 },
      { title: "Health check", category: "Healthcare", amount: 1500 },
      { title: "New headphones", category: "Shopping", amount: 3120 },
      { title: "Internet bill", category: "Bills", amount: 1800 },
      { title: "Weekend lunch", category: "Food", amount: 3780 },
    ].map((e, i) => ({
      kind: "expense" as const,
      title: e.title,
      data: e,
      dueAt: at(12, 0, i === 0 ? 0 : -i),
    })),
    {
      kind: "income",
      title: "Monthly income",
      data: { amount: 35000, currency: "INR", category: "Salary" },
      dueAt: at(9, 0, -2),
    },
    ...[
      { metric: "steps", value: 7842, unit: "steps" },
      { metric: "sleep", value: 7.2, unit: "hours" },
      { metric: "heart_rate", value: 72, unit: "bpm" },
      { metric: "weight", value: 68, unit: "kg" },
      { metric: "water", value: 1.8, unit: "L" },
      { metric: "calories", value: 420, unit: "kcal" },
    ].map((e) => ({
      kind: "health" as const,
      title: e.metric,
      data: { ...e, recordedAt: at(8) },
    })),
    {
      kind: "medicine",
      title: "Vitamin D",
      data: {
        dosage: "1 tablet",
        quantity: 24,
        dailyConsumption: 1,
        takenDates: [key],
        instructions: "Track as prescribed by your clinician",
      },
      dueAt: at(8, 30),
      recurrence: "daily",
    },
    {
      kind: "medicine",
      title: "Multivitamin",
      data: {
        dosage: "1 tablet",
        quantity: 12,
        dailyConsumption: 1,
        takenDates: [],
      },
      dueAt: at(20),
      recurrence: "daily",
    },
    {
      kind: "medicine",
      title: "Prescription reminder",
      data: {
        dosage: "As prescribed",
        quantity: 6,
        dailyConsumption: 1,
        takenDates: [key],
      },
      dueAt: at(8),
      recurrence: "daily",
    },
    {
      kind: "goal",
      title: "Build my emergency fund",
      data: { target: 50000, current: 41000, unit: "INR", category: "Finance" },
    },
    {
      kind: "goal",
      title: "Read 12 books",
      data: { target: 12, current: 8, unit: "books", category: "Education" },
    },
    ...["Study", "Exercise", "Read", "Meditation", "Water"].map((title, i) => ({
      kind: "habit" as const,
      title,
      data: {
        frequency: "daily",
        completedDates: [
          key,
          ...[1, 2, 3, 4]
            .filter((n) => (n + i) % 3 !== 0)
            .map((n) => {
              const d = new Date(now);
              d.setDate(d.getDate() - n);
              return new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(d);
            }),
        ],
      },
      recurrence: "daily",
    })),
    {
      kind: "project",
      title: "Personal website",
      data: { budget: 5000, progress: 64, start: at(9, 0, -20) },
    },
    {
      kind: "note",
      title: "Ideas for the next chapter",
      data: {
        content:
          "## Make space for what matters\n\n- Finish the personal website\n- Read a little every day\n- Plan a weekend away",
        format: "markdown",
      },
    },
    {
      kind: "person",
      title: "Dr. Priya",
      data: { email: "", phone: "", relationship: "Dentist" },
    },
    {
      kind: "event",
      title: "Dentist appointment",
      data: {
        start: at(17, 0, 1),
        end: at(18, 0, 1),
        location: "Dental clinic",
        participants: [],
      },
      dueAt: at(17, 0, 1),
      status: "scheduled",
    },
    {
      kind: "reminder",
      title: "Dentist appointment reminder",
      data: { channel: "in_app" },
      dueAt: at(16, 45, 1),
    },
    {
      kind: "bill",
      title: "Internet",
      data: { amount: 799, category: "Utilities" },
      dueAt: at(9, 0, 5),
      recurrence: "monthly",
    },
    {
      kind: "subscription",
      title: "Netflix",
      data: { amount: 499, category: "Streaming" },
      dueAt: at(9, 0, 6),
      recurrence: "monthly",
    },
    {
      kind: "subscription",
      title: "Google One",
      data: { amount: 130, category: "Storage" },
      dueAt: at(9, 0, 9),
      recurrence: "monthly",
    },
    {
      kind: "subscription",
      title: "Spotify",
      data: { amount: 119, category: "Music" },
      dueAt: at(9, 0, 15),
      recurrence: "monthly",
    },
    {
      kind: "order",
      title: "Mechanical keyboard",
      data: { store: "Amazon", orderId: "DEMO-001", amount: 4200 },
      dueAt: at(14, 0, 1),
      status: "shipped",
    },
    {
      kind: "order",
      title: "Wireless mouse",
      data: { store: "Flipkart", orderId: "DEMO-002", amount: 1200 },
      dueAt: at(14, 0, 2),
      status: "ordered",
    },
    {
      kind: "shopping",
      title: "Fresh fruit",
      data: { quantity: 2, category: "Groceries" },
    },
    ...[
      { title: "Oats + Banana", category: "Breakfast", h: 8 },
      { title: "Rice + Curries", category: "Lunch", h: 13 },
      { title: "Nuts + Fruits", category: "Snack", h: 17 },
      { title: "Chapati + Veg", category: "Dinner", h: 20 },
    ].map((e) => ({
      kind: "meal" as const,
      title: e.title,
      data: { category: e.category, ingredients: e.title },
      dueAt: at(e.h),
    })),
    {
      kind: "trip",
      title: "A weekend in the hills",
      data: {
        destination: "Ooty",
        start: at(8, 0, 14),
        end: at(18, 0, 16),
        bookings: "",
      },
      dueAt: at(8, 0, 14),
    },
    {
      kind: "vehicle",
      title: "My scooter",
      data: {
        make: "Honda",
        model: "Activa",
        registration: "DEMO",
        serviceDue: at(9, 0, 20),
      },
    },
    {
      kind: "document",
      title: "Travel checklist",
      data: { category: "Other" },
      description: "Demo metadata only. No file uploaded.",
    },
    {
      kind: "wellbeing",
      title: "Daily check-in",
      data: { mood: 4, energy: 6, stress: 3 },
      dueAt: at(8),
    },
  ];
  await db.transaction(async (tx) => {
    const ids = new Map<string, string>();
    for (const r of records) {
      const parsed = createEntitySchema.parse(r);
      const [entity] = await tx
        .insert(entities)
        .values({
          ...parsed,
          data: parsed.data as Record<string, unknown>,
          dueAt: parsed.dueAt ? new Date(parsed.dueAt) : null,
          ownerId: user.id,
        })
        .returning();
      if (entity) ids.set(entity.title, entity.id);
    }
    for (const [a, b, relationship] of [
      ["Dentist appointment", "Dr. Priya", "assigned_to"],
      ["Dentist appointment", "Dentist appointment reminder", "scheduled_for"],
      ["Dentist appointment", "Health check", "paid_by"],
      ["Personal website", "Project meeting notes", "part_of"],
      ["Personal website", "Ideas for the next chapter", "related"],
      ["A weekend in the hills", "Travel checklist", "attached_to"],
      ["Read 12 books", "Read", "supports"],
    ]) {
      const sourceId = ids.get(a!);
      const targetId = ids.get(b!);
      if (sourceId && targetId)
        await tx.insert(entityLinks).values({
          ownerId: user.id,
          sourceId,
          targetId,
          relationship: relationship!,
        });
    }
  });
  console.log(`Created ${records.length} explicitly synthetic demo records`);
}
await pool.end();
