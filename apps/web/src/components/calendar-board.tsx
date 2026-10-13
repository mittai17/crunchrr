"use client";
import {
  addDays,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import type { Entity } from "@crunchrr/validation";
import { Schedule, Empty, type DashboardProps } from "./dashboard";
export function CalendarBoard({
  date,
  view,
  onMove,
  holidays,
  ...props
}: DashboardProps & {
  date: Date;
  view: string;
  onMove: (entity: Entity, date: Date) => void;
  holidays: { date: string; name: string }[];
}) {
  const { entities, open } = props;
  const events = entities
    .filter((e) => e.kind === "event")
    .sort((a, b) => String(a.data.start).localeCompare(String(b.data.start)));
  const datedRecords = entities
    .filter((entity) => entity.kind !== "event" && entity.dueAt)
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
  if (view === "Day") return <Schedule {...props} date={date} />;
  if (view === "Agenda")
    return (
      <div className="agenda-events">
        {events.length || datedRecords.length || holidays.length ? (
          <>
          {holidays.filter((holiday) => holiday.date >= format(date, "yyyy-MM-dd")).slice(0, 40).map((holiday) => (
            <div className="agenda-holiday" key={`${holiday.date}-${holiday.name}`}><time>{holiday.date}</time><strong>{holiday.name}</strong><small>Public holiday</small></div>
          ))}
          {datedRecords.map((e) => (
            <button key={e.id} onClick={() => open(e)}>
              <time>{format(new Date(String(e.dueAt)), "MMM d · h:mm a")}</time>
              <strong>{e.title}</strong>
              <small>{e.kind === "reminder" ? "Reminder" : "Task"}</small>
            </button>
          ))}
          {events.map((e) => (
            <button key={e.id} onClick={() => open(e)}>
              <time>
                {format(new Date(String(e.data.start)), "MMM d · h:mm a")}
              </time>
              <strong>{e.title}</strong>
              <small>{String(e.data.location)}</small>
            </button>
          ))}
          </>
        ) : (
          <Empty kind="event" add={props.add} />
        )}
      </div>
    );
  const start =
      view === "Week" ? startOfWeek(date) : startOfWeek(startOfMonth(date)),
    end = view === "Week" ? endOfWeek(date) : endOfWeek(endOfMonth(date));
  const days = eachDayOfInterval({ start, end });
  return (
    <div className="calendar-board-scroll">
      <div className={`calendar-board ${view === "Week" ? "week-board" : ""}`}>
        {days.map((day) => (
          <div
            className={`calendar-cell ${!isSameMonth(day, date) ? "other-month" : ""} ${isSameDay(day, new Date()) ? "today-cell" : ""}`}
            key={day.toISOString()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("crunchrr/entity");
              const event = events.find((v) => v.id === id);
              if (event) onMove(event, day);
            }}
          >
            <time>{format(day, view === "Week" ? "EEE d" : "d")}</time>
            {holidays.filter((holiday) => holiday.date === format(day, "yyyy-MM-dd")).map((holiday) => (
              <span className="calendar-board-holiday" key={`${holiday.date}-${holiday.name}`}>{holiday.name}</span>
            ))}
            {datedRecords.filter((entity) => entity.dueAt && isSameDay(new Date(entity.dueAt), day)).map((entity) => (
              <button key={entity.id} className="calendar-board-reminder" onClick={() => open(entity)}>
                <span>{entity.kind === "reminder" ? "Reminder" : "Task"}</span>
                <strong>{entity.title}</strong>
              </button>
            ))}
            {events
              .filter((e) => isSameDay(new Date(String(e.data.start)), day))
              .map((e) => (
                <button
                  key={e.id}
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("crunchrr/entity", e.id)
                  }
                  onClick={() => open(e)}
                >
                  <span>
                    {format(new Date(String(e.data.start)), "h:mm a")}
                  </span>
                  <strong>{e.title}</strong>
                </button>
              ))}
          </div>
        ))}
      </div>
      <p className="muted">
        Drag an event to another date to reschedule, or open it to edit.
      </p>
    </div>
  );
}
