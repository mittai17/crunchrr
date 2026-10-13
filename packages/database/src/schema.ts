import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  index,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/pg-core";
import type { EntityKind, EntityData, Profile } from "@crunchrr/validation";
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  profile: jsonb().$type<Profile>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const entities = pgTable(
  "entities",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text().$type<EntityKind>().notNull(),
    title: text().notNull(),
    description: text().notNull().default(""),
    status: text().notNull().default("todo"),
    priority: text().notNull().default("medium"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    recurrence: text().notNull().default("none"),
    tags: jsonb().$type<string[]>().notNull().default([]),
    data: jsonb().$type<EntityData>().notNull().default({}),
    version: integer().notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("entities_owner_kind").on(t.ownerId, t.kind),
    index("entities_owner_due").on(t.ownerId, t.dueAt),
    uniqueIndex("entities_owner_id").on(t.ownerId, t.id),
  ],
);
export const entityLinks = pgTable(
  "entity_links",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id").notNull(),
    targetId: uuid("target_id").notNull(),
    relationship: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      columns: [t.ownerId, t.sourceId],
      foreignColumns: [entities.ownerId, entities.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [t.ownerId, t.targetId],
      foreignColumns: [entities.ownerId, entities.id],
    }).onDelete("cascade"),
    uniqueIndex("links_unique").on(
      t.ownerId,
      t.sourceId,
      t.targetId,
      t.relationship,
    ),
    index("links_target").on(t.ownerId, t.targetId),
  ],
);
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text().notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("audit_owner_created").on(t.ownerId, t.createdAt)],
);
export const notifications = pgTable(
  "notifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityId: uuid("entity_id").references(() => entities.id, {
      onDelete: "cascade",
    }),
    title: text().notNull(),
    read: boolean().notNull().default(false),
    dedupeKey: text("dedupe_key").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notifications_owner").on(t.ownerId, t.createdAt)],
);
export const files = pgTable(
  "files",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text().notNull().unique(),
    name: text().notNull(),
    contentType: text("content_type").notNull(),
    size: integer().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("files_owner").on(t.ownerId)],
);
