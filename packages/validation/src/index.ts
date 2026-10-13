import { z } from "zod";
export const entityKinds = [
  "task",
  "event",
  "reminder",
  "note",
  "expense",
  "income",
  "account",
  "budget",
  "health",
  "medicine",
  "goal",
  "habit",
  "wellbeing",
  "project",
  "person",
  "meal",
  "trip",
  "vehicle",
  "shopping",
  "order",
  "bill",
  "subscription",
  "document",
] as const;
export const kindSchema = z.enum(entityKinds);
export type EntityKind = z.infer<typeof kindSchema>;
export const recurrenceSchema = z.enum([
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);
const date = z.string().datetime({ offset: true });
const text = z.string().trim().max(2000);
const money = z.number().nonnegative().max(1e12);
const base = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(20000).default(""),
  dueAt: date.nullable().default(null),
  status: z
    .enum([
      "inbox",
      "todo",
      "in_progress",
      "completed",
      "cancelled",
      "scheduled",
      "taken",
      "skipped",
      "missed",
      "snoozed",
      "ordered",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "returned",
      "active",
      "paused",
      "read",
      "unread",
    ])
    .default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  recurrence: recurrenceSchema.default("none"),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
});
export const dataSchemas = {
  task: z.object({
    trackedMinutes: z.number().nonnegative().max(1000000).optional(),
    trackedAt: date.optional(),
    completedAt: date.optional(),
    estimatedMinutes: z.number().int().min(0).max(100000).optional(),
    subtasks: z
      .array(z.object({ title: text, completed: z.boolean() }))
      .max(100)
      .optional(),
  }),
  event: z
    .object({
      start: date,
      end: date,
      location: text.default(""),
      meetingUrl: z.union([z.url().startsWith("https://"), z.literal("")]).default(""),
      participants: z.array(z.string().uuid()).max(100).default([]),
    })
    .refine((d) => new Date(d.end) > new Date(d.start), {
      message: "End must be after start",
      path: ["end"],
    }),
  reminder: z.object({
    channel: z.enum(["in_app", "email", "push"]).default("in_app"),
    snoozedUntil: date.nullable().optional(),
  }),
  note: z.object({
    content: z.string().max(100000).default(""),
    format: z.enum(["markdown", "text"]).default("markdown"),
    progress: z.number().min(0).max(100).default(0),
    durationMinutes: z.number().nonnegative().max(1000000).default(0),
  }),
  expense: z.object({
    amount: money,
    currency: z.string().length(3).default("INR"),
    category: text.default("Other"),
    accountId: z.string().uuid().optional(),
  }),
  income: z.object({
    amount: money,
    currency: z.string().length(3).default("INR"),
    category: text.default("Salary"),
    accountId: z.string().uuid().optional(),
  }),
  account: z.object({
    balance: z.number().min(-1e12).max(1e12).default(0),
    currency: z.string().length(3).default("INR"),
  }),
  budget: z.object({
    amount: money,
    currency: z.string().length(3).default("INR"),
    category: text.default("Other"),
  }),
  health: z.object({
    metric: z.enum([
      "steps",
      "weight",
      "height",
      "heart_rate",
      "blood_pressure",
      "glucose",
      "sleep",
      "water",
      "calories",
      "exercise",
      "symptom",
    ]),
    value: z.number().min(0).max(1e7),
    unit: text.default(""),
    recordedAt: date,
  }),
  medicine: z.object({
    dosage: text,
    unit: text.default("tablets"),
    quantity: z.number().int().nonnegative().max(100000),
    dailyConsumption: z.number().positive().max(1000),
    instructions: text.default(""),
    doctor: text.default(""),
    takenDates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .max(10000)
      .default([]),
  }),
  goal: z.object({
    target: z.number().positive().max(1e12),
    current: z.number().nonnegative().max(1e12).default(0),
    unit: text.default(""),
    category: text.default("Personal"),
  }),
  habit: z.object({
    frequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
    completedDates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      .max(10000)
      .default([]),
  }),
  wellbeing: z.object({
    mood: z.number().int().min(1).max(5),
    energy: z.number().int().min(1).max(10),
    stress: z.number().int().min(1).max(10),
    sleepQuality: z.number().int().min(1).max(5).optional(),
  }),
  project: z.object({
    budget: money.default(0),
    progress: z.number().min(0).max(100).default(0),
    start: date.nullable().default(null),
  }),
  person: z.object({
    displayOrder: z.number().int().min(0).max(100).default(0),
    progress: z.number().min(0).max(100).default(0),
    avatarUrl: z
      .union([z.url().refine((v) => v.startsWith("https://")), z.literal("")])
      .default(""),
    email: z.union([z.email(), z.literal("")]).default(""),
    phone: z.string().max(30).default(""),
    relationship: text.default(""),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  meal: z.object({
    category: z.enum(["Breakfast", "Lunch", "Snack", "Dinner"]),
    ingredients: text.default(""),
    calories: z.number().nonnegative().optional(),
  }),
  trip: z
    .object({
      destination: text,
      start: date,
      end: date,
      bookings: text.default(""),
    })
    .refine((d) => new Date(d.end) >= new Date(d.start), {
      message: "End must not precede start",
      path: ["end"],
    }),
  vehicle: z.object({
    make: text,
    model: text,
    registration: text,
    insuranceExpiry: date.nullable().default(null),
    serviceDue: date.nullable().default(null),
  }),
  shopping: z.object({
    quantity: z.number().positive().max(100000).default(1),
    category: text.default("Other"),
  }),
  order: z.object({
    store: text,
    orderId: text.default(""),
    amount: money,
    currency: z.string().length(3).default("INR"),
    trackingUrl: z
      .union([
        z
          .url()
          .refine((v) => v.startsWith("https://"), "Use an HTTPS tracking URL"),
        z.literal(""),
      ])
      .default(""),
  }),
  bill: z.object({
    amount: money,
    currency: z.string().length(3).default("INR"),
    category: text.default("Utilities"),
  }),
  subscription: z.object({
    amount: money,
    currency: z.string().length(3).default("INR"),
    category: text.default("Software"),
  }),
  document: z.object({
    category: z
      .enum([
        "Identity",
        "Education",
        "Health",
        "Insurance",
        "Vehicle",
        "Tax",
        "Finance",
        "Contracts",
        "Warranty",
        "Receipts",
        "Certificates",
        "Other",
      ])
      .default("Other"),
    fileId: z.string().uuid().optional(),
    issueDate: date.nullable().default(null),
  }),
} satisfies Record<EntityKind, z.ZodType>;
const variants = entityKinds.map((kind) =>
  base.extend({ kind: z.literal(kind), data: dataSchemas[kind] }),
);
export const createEntitySchema = z.discriminatedUnion(
  "kind",
  variants as [(typeof variants)[number], ...(typeof variants)[number][]],
);
export type CreateEntity = z.infer<typeof createEntitySchema>;
export type EntityData = Record<string, unknown>;
export interface Entity {
  id: string;
  ownerId: string;
  kind: EntityKind;
  title: string;
  description: string;
  status: CreateEntity["status"];
  priority: CreateEntity["priority"];
  dueAt: string | null;
  recurrence: CreateEntity["recurrence"];
  tags: string[];
  data: EntityData;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export const updateEntitySchema = z
  .object({
    version: z.number().int().positive(),
    changes: z
      .object({
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().max(20000).optional(),
        status: base.shape.status.optional(),
        priority: base.shape.priority.optional(),
        dueAt: date.nullable().optional(),
        recurrence: recurrenceSchema.optional(),
        tags: base.shape.tags.optional(),
        data: z.record(z.string(), z.unknown()).optional(),
      })
      .strict(),
  })
  .strict();
export const linkSchema = z
  .object({
    sourceId: z.string().uuid(),
    targetId: z.string().uuid(),
    relationship: z
      .enum([
        "related",
        "part_of",
        "scheduled_for",
        "paid_by",
        "prescribed_for",
        "assigned_to",
        "depends_on",
        "supports",
        "attached_to",
      ])
      .default("related"),
  })
  .strict()
  .refine((d) => d.sourceId !== d.targetId, "Cannot link a record to itself");
export interface EntityLink {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  createdAt: string;
  entity: Entity;
}
export const profileSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    timezone: z.string().refine((v) => {
      try {
        Intl.DateTimeFormat("en", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }, "Invalid timezone"),
    currency: z.string().regex(/^[A-Z]{3}$/),
    theme: z.enum(["light", "dark", "system"]),
    aiPermissions: z.array(kindSchema).max(entityKinds.length),
    widgets: z.array(z.string().max(40)).max(30),
    onboarded: z.boolean(),
    notifications: z.boolean(),
  })
  .strict();
export type Profile = z.infer<typeof profileSchema>;
export const aiRequestSchema = z
  .object({ message: z.string().trim().min(1).max(2000) })
  .strict();
export const uploadSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    contentType: z.enum([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
    ]),
    size: z
      .number()
      .int()
      .positive()
      .max(20 * 1024 * 1024),
  })
  .strict();

export interface WorkAnalytics {
  hoursLastWeek: number;
  completedLastWeek: number;
  daily: { label: string; date: string; minutes: number }[];
  monthly: {
    label: string;
    total: number;
    completed: number;
    percentage: number;
  }[];
}
