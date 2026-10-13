import { describe, expect, it } from "vitest";
import type { Entity } from "@crunchrr/validation";
import {
  layoutCalendarEvents,
  eventCategory,
} from "../apps/web/src/lib/calendar-layout";
const day = new Date("2026-10-07T00:00:00");
const event = (id: string, start: string, end: string, tags: string[] = []) =>
  ({ id, kind: "event", title: id, tags, data: { start, end } }) as Entity;
describe("calendar placement", () => {
  it("keeps overlapping events in separate columns and gives later events full width", () => {
    const rows = layoutCalendarEvents(
      [
        event("long", "2026-10-07T09:00:00", "2026-10-07T11:00:00"),
        event("short", "2026-10-07T09:30:00", "2026-10-07T10:00:00"),
        event("next", "2026-10-07T10:00:00", "2026-10-07T10:30:00"),
        event("later", "2026-10-07T11:00:00", "2026-10-07T12:00:00"),
      ],
      day,
    );
    expect(rows.map((r) => [r.event.id, r.column, r.columns])).toEqual([
      ["long", 0, 2],
      ["short", 1, 2],
      ["next", 1, 2],
      ["later", 0, 1],
    ]);
  });
  it("clips overnight events to the displayed day without duplicating outside-day events", () => {
    const rows = layoutCalendarEvents(
      [
        event("overnight", "2026-10-06T23:00:00", "2026-10-07T01:00:00"),
        event("past", "2026-10-06T12:00:00", "2026-10-06T13:00:00"),
        event("tomorrow", "2026-10-08T00:00:00", "2026-10-08T01:00:00"),
      ],
      day,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.startMinute).toBe(0);
    expect(rows[0]?.endMinute).toBe(60);
  });
  it("honors explicit category tags over title-based fallback", () => {
    expect(
      eventCategory(
        event("Study time", "2026-10-07T09:00:00", "2026-10-07T10:00:00", [
          "category:work",
        ]),
      ),
    ).toBe("work");
    expect(
      eventCategory(
        event("Study time", "2026-10-07T09:00:00", "2026-10-07T10:00:00"),
      ),
    ).toBe("education");
  });
});
