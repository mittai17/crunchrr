import type { Entity } from "@crunchrr/validation";

export type CalendarCategory = "work" | "personal" | "education";
export function eventCategory(event: Entity): CalendarCategory {
  for (const category of ["work", "personal", "education"] as const)
    if (
      event.tags.includes(category) ||
      event.tags.includes(`category:${category}`)
    )
      return category;
  if (/college|class|study|learning/i.test(event.title)) return "education";
  if (/family|gym|lunch|breakfast|dentist|birthday|home/i.test(event.title))
    return "personal";
  return "work";
}

/** Assign overlapping events columns, sharing a consistent width within each cluster. */
export function layoutCalendarEvents(events: Entity[], day: Date) {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const rows = events
    .map((event) => ({
      event,
      start: Math.max(
        new Date(String(event.data.start)).getTime(),
        dayStart.getTime(),
      ),
      end: Math.min(
        new Date(String(event.data.end)).getTime(),
        dayEnd.getTime(),
      ),
      column: 0,
      columns: 1,
    }))
    .filter(
      (row) =>
        Number.isFinite(row.start) &&
        Number.isFinite(row.end) &&
        row.end > row.start,
    )
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster: typeof rows = [],
    columnEnds: number[] = [],
    clusterEnd = 0;
  const finish = () => {
    for (const row of cluster) row.columns = columnEnds.length;
  };
  for (const row of rows) {
    if (row.start >= clusterEnd) {
      finish();
      cluster = [];
      columnEnds = [];
    }
    let column = columnEnds.findIndex((end) => end <= row.start);
    if (column === -1) column = columnEnds.length;
    row.column = column;
    columnEnds[column] = row.end;
    cluster.push(row);
    clusterEnd = Math.max(...columnEnds);
  }
  finish();
  return rows.map((row) => ({
    ...row,
    startMinute: (row.start - dayStart.getTime()) / 60000,
    endMinute: (row.end - dayStart.getTime()) / 60000,
  }));
}
