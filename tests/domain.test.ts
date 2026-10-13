import { describe, it, expect } from "vitest";
import {
  createEntitySchema,
  linkSchema,
  profileSchema,
  uploadSchema,
  entityKinds,
} from "@crunchrr/validation";
import {
  defaultData,
  parseQuickAdd,
  nextOccurrence,
  dayKey,
  dashboardStats,
} from "@crunchrr/utils";
describe("typed module contracts", () => {
  it.each(entityKinds)("accepts a valid %s record", (kind) => {
    const data = defaultData(kind);
    if (kind === "medicine") data.dosage = "As prescribed";
    expect(
      createEntitySchema.safeParse({ kind, title: "Example", data }).success,
    ).toBe(true);
  });
  it("rejects negative finance amounts and invalid calendar intervals", () => {
    expect(
      createEntitySchema.safeParse({
        kind: "expense",
        title: "Invalid",
        data: { amount: -1 },
      }).success,
    ).toBe(false);
    expect(
      createEntitySchema.safeParse({
        kind: "event",
        title: "Invalid",
        data: { start: "2026-10-07T12:00:00Z", end: "2026-10-07T11:00:00Z" },
      }).success,
    ).toBe(false);
  });
  it("validates medicine inventory without prescribing a dosage", () => {
    expect(
      createEntitySchema.safeParse({
        kind: "medicine",
        title: "Track",
        data: { dosage: "As prescribed", quantity: -1, dailyConsumption: 1 },
      }).success,
    ).toBe(false);
  });
  it("accepts HTTPS meeting links and rejects unsafe schemes", () => {
    const start = "2026-10-12T09:00:00Z";
    const end = "2026-10-12T10:00:00Z";
    const event = (meetingUrl: string) => ({
      kind: "event",
      title: "Team meeting",
      data: { start, end, meetingUrl },
    });
    expect(createEntitySchema.safeParse(event("https://meet.example.com/room")).success).toBe(true);
    expect(createEntitySchema.safeParse(event("javascript:alert(1)")).success).toBe(false);
    expect(createEntitySchema.safeParse(event("http://meet.example.com/room")).success).toBe(false);
  });
  it("rejects self-links, unsafe upload types and invalid timezone settings", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(linkSchema.safeParse({ sourceId: id, targetId: id }).success).toBe(
      false,
    );
    expect(
      uploadSchema.safeParse({
        name: "script",
        contentType: "text/html",
        size: 200,
      }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({
        name: "User",
        timezone: "not-a-zone",
        currency: "INR",
        theme: "system",
        aiPermissions: [],
        widgets: [],
        notifications: true,
        onboarded: true,
      }).success,
    ).toBe(false);
  });
});
describe("date and interpretation rules", () => {
  it("clamps monthly reminders to the final day rather than overflowing", () => {
    expect(
      nextOccurrence(
        new Date("2026-01-31T08:30:00Z"),
        "monthly",
      )?.toISOString(),
    ).toBe("2026-02-28T08:30:00.000Z");
  });
  it("preserves a leap-day yearly reminder in February", () => {
    expect(
      nextOccurrence(new Date("2024-02-29T08:00:00Z"), "yearly")?.toISOString(),
    ).toBe("2025-02-28T08:00:00.000Z");
  });
  it("resolves an INR expense with mandatory review", () => {
    const result = parseQuickAdd("Bought groceries for ₹840");
    expect(result).toMatchObject({
      kind: "expense",
      data: { amount: 840, category: "Food" },
      needsReview: true,
    });
  });
  it("keeps calendar dates scoped to the profile timezone", () => {
    expect(dayKey(new Date("2026-10-06T22:00:00Z"), "Asia/Kolkata")).toBe(
      "2026-10-07",
    );
  });
  it("handles empty dashboards without fabricated progress", () => {
    expect(dashboardStats([], "Asia/Kolkata")).toEqual({
      tasks: 0,
      completed: 0,
      events: 0,
      expenses: 0,
      steps: 0,
      medicines: 0,
      taken: 0,
      goals: 0,
    });
  });
});
