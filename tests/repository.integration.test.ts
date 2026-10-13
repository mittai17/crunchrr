import { describe, it, expect, afterAll } from "vitest";
import { Repository } from "../apps/api/src/repository";
import { createEntitySchema } from "@crunchrr/validation";
import { users } from "@crunchrr/database";
import { eq } from "drizzle-orm";
const repository = new Repository();
const createdUsers: string[] = [];
afterAll(async () => {
  for (const id of createdUsers)
    await repository.db.delete(users).where(eq(users.id, id));
  await repository.onModuleDestroy();
});
describe("owner-scoped persistent Life Graph", () => {
  it("persists CRUD, rejects cross-owner access and prevents stale writes", async () => {
    const suffix = crypto.randomUUID();
    const a = await repository.user(`integration_a_${suffix}`),
      b = await repository.user(`integration_b_${suffix}`);
    createdUsers.push(a.id, b.id);
    const task = await repository.create(
      a.id,
      createEntitySchema.parse({
        kind: "task",
        title: "Integration task",
        data: {},
      }),
    );
    expect((await repository.owned(a.id, task.id)).title).toBe(
      "Integration task",
    );
    await expect(repository.owned(b.id, task.id)).rejects.toThrow(
      "Record not found",
    );
    await expect(
      repository.update(b.id, task.id, {
        version: 1,
        changes: { title: "Unauthorized" },
      }),
    ).rejects.toThrow();
    const updated = await repository.update(a.id, task.id, {
      version: 1,
      changes: { status: "completed" },
    });
    expect(updated.version).toBe(2);
    await expect(
      repository.update(a.id, task.id, {
        version: 1,
        changes: { title: "Stale" },
      }),
    ).rejects.toThrow("This record changed");
    const other = await repository.create(
      b.id,
      createEntitySchema.parse({
        kind: "note",
        title: "Private note",
        data: { content: "Private" },
      }),
    );
    await expect(
      repository.link(a.id, {
        sourceId: task.id,
        targetId: other.id,
        relationship: "related",
      }),
    ).rejects.toThrow();
    const expense = await repository.create(
      a.id,
      createEntitySchema.parse({
        kind: "expense",
        title: "Integration lunch",
        data: { amount: 100, category: "Food" },
      }),
    );
    await repository.link(a.id, {
      sourceId: task.id,
      targetId: expense.id,
      relationship: "paid_by",
    });
    expect((await repository.links(a.id, task.id))[0]?.entity.id).toBe(
      expense.id,
    );
    expect(
      (
        await repository.list(a.id, undefined, "Integration lunch", 1, 50)
      ).items.some((e) => e.id === expense.id),
    ).toBe(true);
    await repository.remove(a.id, expense.id);
    expect(await repository.links(a.id, task.id)).toEqual([]);
    await repository.remove(a.id, task.id);
    await expect(repository.owned(a.id, task.id)).rejects.toThrow();
  });
});
