"use client";
import { useEffect, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Bell,
  Video,
  Plus,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import type { Entity } from "@crunchrr/validation";
import { CalendarBoard } from "./calendar-board";
import type { DashboardProps } from "./dashboard";
import {
  eventCategory,
  layoutCalendarEvents,
  type CalendarCategory,
} from "@/lib/calendar-layout";
const categories = ["work", "personal", "education"] as const;
const hourHeight = 76;
const hours = Array.from({ length: 24 }, (_, i) => i);
type Holiday = { date: string; name: string };
type HolidayResponse = {
  countries: Record<string, string>;
  states: Record<string, string>;
  holidays: Holiday[];
};
function eventTime(event: Entity) {
  return `${format(new Date(String(event.data.start)), "h:mm a")} – ${format(new Date(String(event.data.end)), "h:mm a")}`;
}

export function CalendarWorkspace({
  date,
  view,
  onDate,
  onView,
  onMove,
  onCreate,
  onCreateReminder,
  onFavorite,
  demo,
  ...props
}: DashboardProps & {
  date: Date;
  view: string;
  onDate: (date: Date) => void;
  onView: (view: string) => void;
  onMove: (event: Entity, start: Date) => void;
  onCreate: (date: Date) => void;
  onCreateReminder: (date: Date) => void;
  onFavorite: (event: Entity) => void;
  demo: boolean;
}) {
  const [month, setMonth] = useState(startOfMonth(date));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [calendars, setCalendars] = useState({
    events: true,
    tasks: true,
    reminders: true,
    birthdays: false,
  });
  const [country, setCountry] = useState("IN");
  const [state, setState] = useState("");
  const [holidayData, setHolidayData] = useState<HolidayResponse | null>(null);
  const [holidayError, setHolidayError] = useState("");
  const [enabled, setEnabled] = useState<Record<CalendarCategory, boolean>>({
    work: true,
    personal: true,
    education: true,
  });
  const [active, setActive] = useState<{
    id: string;
    left: number;
    top: number;
  } | null>(null);
  const origin = useRef<HTMLButtonElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const scroll = useRef<HTMLDivElement | null>(null);
  const events = props.entities.filter((e) => e.kind === "event");
  const visibleEvents = calendars.events
    ? events.filter((e) => enabled[eventCategory(e)])
    : [];
  const holidays = holidayData?.holidays || [];
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const tomorrowKey = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const todayHoliday = holidays.filter((holiday) => holiday.date === todayKey);
  const tomorrowHoliday = holidays.filter((holiday) => holiday.date === tomorrowKey);
  const upcomingReminders = props.entities
    .filter((entity) => entity.kind === "reminder" && entity.dueAt && new Date(entity.dueAt) >= new Date())
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))
    .slice(0, 2);
  const nextMeeting = events
    .filter((event) => typeof event.data.meetingUrl === "string" && event.data.meetingUrl.startsWith("https://") && new Date(String(event.data.start)) >= new Date())
    .sort((a, b) => String(a.data.start).localeCompare(String(b.data.start)))[0];
  const selected = events.find((e) => e.id === active?.id);
  const people = props.entities.filter((e) => e.kind === "person");
  const days =
    view === "Day"
      ? [date]
      : eachDayOfInterval({
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 }),
        });
  const miniDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  useEffect(() => {
    setMonth(startOfMonth(date));
    setActive(null);
  }, [date]);
  useEffect(() => {
    const savedCountry = window.localStorage.getItem("crunchrr-holiday-country");
    const savedState = window.localStorage.getItem("crunchrr-holiday-state");
    if (savedCountry) setCountry(savedCountry);
    if (savedState) setState(savedState);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const years = [...new Set([date.getFullYear(), startOfWeek(startOfMonth(date)).getFullYear(), endOfWeek(endOfMonth(date)).getFullYear(), new Date().getFullYear(), addDays(new Date(), 1).getFullYear()])];
    setHolidayError("");
    Promise.all(years.map(async (year) => {
      const response = await fetch(`/api/holidays?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&year=${year}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Holiday calendar unavailable.");
      return data as HolidayResponse;
    })).then((results) => {
      setHolidayData({ ...results[0], holidays: results.flatMap((result) => result.holidays) });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setHolidayData(null);
      setHolidayError(error instanceof Error ? error.message : "Holiday calendar unavailable.");
    });
    return () => controller.abort();
  }, [country, state, date.getFullYear()]);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = 8 * hourHeight - 14;
  }, [view]);
  useEffect(() => {
    if (!active) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        origin.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        !(event.target as Element).closest(".calendar-preview, .planner-event")
      )
        setActive(null);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [active]);
  useEffect(() => {
    if (!active?.id) return;
    previewRef.current
      ?.querySelector<HTMLButtonElement>(".preview-close")
      ?.focus();
  }, [active?.id]);
  const chooseDate = (next: Date) => {
    onDate(next);
    setFiltersOpen(false);
  };
  const move = (direction: number) =>
    onDate(
      view === "Month"
        ? addMonths(date, direction)
        : view === "Day"
          ? addDays(date, direction)
          : addWeeks(date, direction),
    );
  const showEvent = (event: Entity, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    origin.current = button;
    setActive({
      id: event.id,
      left: Math.max(12, Math.min(rect.right + 12, window.innerWidth - 310)),
      top: Math.max(90, Math.min(rect.top, window.innerHeight - 320)),
    });
  };
  const avatar = (person: Entity) =>
    demo &&
    person.tags.includes("reference-demo") &&
    ["Alicia", "Mark", "James"].includes(person.title)
      ? `/demo/${person.title.toLowerCase()}.jpg`
      : String(person.data.avatarUrl || "");
  return (
    <section className="planner" aria-label="Calendar workspace">
      <button
        className="planner-filter-toggle"
        aria-expanded={filtersOpen}
        aria-controls="calendar-filters"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        <SlidersHorizontal size={16} /> Calendars & filters{" "}
        <ChevronDown size={14} />
      </button>
      <aside
        id="calendar-filters"
        className={`planner-sidebar ${filtersOpen ? "is-open" : ""}`}
        aria-label="Calendar filters"
      >
        <section className="planner-mini">
          <header>
            <h2>{format(month, "MMMM yyyy")}</h2>
            <button
              aria-label="Previous mini calendar month"
              onClick={() => setMonth(addMonths(month, -1))}
            >
              <ChevronLeft size={13} />
            </button>
            <button
              aria-label="Next mini calendar month"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight size={13} />
            </button>
          </header>
          <div className="planner-mini-week">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="planner-mini-days">
            {miniDays.map((day) => (
              <button
                key={day.toISOString()}
                aria-label={format(day, "EEEE, MMMM d, yyyy")}
                aria-pressed={isSameDay(day, date)}
                className={`${!isSameMonth(day, month) ? "outside-month" : ""} ${isSameDay(day, date) ? "selected" : ""} ${events.some((e) => isSameDay(new Date(String(e.data.start)), day)) ? "has-events" : ""}`}
                onClick={() => chooseDate(day)}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </section>
        <section className="planner-filter-group">
          <h2>
            My calendars <CalendarDays size={14} />
          </h2>
          {(
            [
              ["events", "Events"],
              ["tasks", "Daily tasks"],
              ["reminders", "Reminders"],
              ["birthdays", "Birthdays"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={calendars[key]}
                onChange={(e) =>
                  setCalendars({ ...calendars, [key]: e.target.checked })
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </section>
        <section className="planner-filter-group planner-holiday-settings">
          <h2>Public holidays</h2>
          <label>
            Country
            <select value={country} onChange={(event) => {
              setCountry(event.target.value);
              setState("");
              window.localStorage.setItem("crunchrr-holiday-country", event.target.value);
              window.localStorage.removeItem("crunchrr-holiday-state");
            }}>
              {Object.entries(holidayData?.countries || { IN: "India" }).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
          {Object.keys(holidayData?.states || {}).length > 0 && (
            <label>
              State or province
              <select value={state} onChange={(event) => {
                setState(event.target.value);
                window.localStorage.setItem("crunchrr-holiday-state", event.target.value);
              }}>
                <option value="">National holidays</option>
                {Object.entries(holidayData?.states || {}).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </label>
          )}
          {holidayError && <p role="status">{holidayError}</p>}
          <p className="planner-holiday-note">Listed dates may omit local changes. Check official notices before making plans.</p>
        </section>
        <details className="planner-filter-group planner-favorites">
          <summary>
            Favorites <ChevronRight size={14} />
          </summary>
          {events.filter((event) => event.tags.includes("favorite")).length ? (
            events
              .filter((event) => event.tags.includes("favorite"))
              .map((event) => (
                <button
                  key={event.id}
                  onClick={(e) => showEvent(event, e.currentTarget)}
                >
                  {event.title}
                </button>
              ))
          ) : (
            <p>Save an event from its preview to find it here.</p>
          )}
        </details>
        <section className="planner-filter-group">
          <h2>
            Categories <ChevronDown size={14} />
          </h2>
          {categories.map((category) => (
            <label
              key={category}
              className={`planner-category category-${category}`}
            >
              <input
                type="checkbox"
                checked={enabled[category]}
                onChange={(e) =>
                  setEnabled({ ...enabled, [category]: e.target.checked })
                }
              />
              <i />
              <span>{category[0].toUpperCase() + category.slice(1)}</span>
            </label>
          ))}
        </section>
        <button
          className="planner-new"
          onClick={() => {
            const start = new Date(date);
            start.setHours(9, 0, 0, 0);
            onCreate(start);
          }}
        >
          <Plus size={16} /> New event
        </button>
        <button className="planner-new planner-new-reminder" onClick={() => {
          const when = new Date(date);
          when.setHours(9, 0, 0, 0);
          onCreateReminder(when);
        }}><Bell size={16} /> New reminder</button>
        <div className="planner-people">
          {people.slice(0, 4).map((person) => (
            <button
              key={person.id}
              aria-label={`Open ${person.title}`}
              title={person.title}
              onClick={() => props.open(person)}
            >
              {avatar(person) ? (
                <img
                  src={avatar(person)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span>{person.title.slice(0, 1)}</span>
              )}
            </button>
          ))}
          <p>
            Your connected
            <br />
            people & plans.
          </p>
        </div>
      </aside>
      <div className="planner-main">
        <div className="planner-insights" aria-live="polite">
          <span><CalendarDays size={15} /> {holidayData ? `${holidayData.countries[country]}${state ? ` · ${holidayData.states[state]}` : ""}` : "Public holidays"}</span>
          <strong>{todayHoliday.length ? `Today: ${todayHoliday.map((holiday) => holiday.name).join(", ")}` : "No listed public holiday today"}</strong>
          <strong>{tomorrowHoliday.length ? `Tomorrow: ${tomorrowHoliday.map((holiday) => holiday.name).join(", ")}` : "No listed public holiday tomorrow"}</strong>
        </div>
        <div className="planner-upcoming" aria-label="Upcoming reminders and meetings">
          <span>Coming up</span>
          {upcomingReminders.map((reminder) => (
            <button key={reminder.id} onClick={() => props.open(reminder)}><Bell size={13} /><strong>{reminder.title}</strong><time>{format(new Date(String(reminder.dueAt)), "MMM d, h:mm a")}</time></button>
          ))}
          {nextMeeting && <button onClick={() => props.open(nextMeeting)}><Video size={13} /><strong>{nextMeeting.title}</strong><time>{format(new Date(String(nextMeeting.data.start)), "MMM d, h:mm a")}</time></button>}
          {!upcomingReminders.length && !nextMeeting && <small>No upcoming reminders or linked meetings.</small>}
        </div>
        <header className="planner-top">
          <div className="planner-date-nav">
            <h1>
              <span className="sr-only">Calendar — </span>
              {format(date, "MMMM yyyy")}
            </h1>
            <button
              className="planner-today"
              onClick={() => onDate(new Date())}
            >
              Today
            </button>
            <button
              aria-label="Previous calendar period"
              onClick={() => move(-1)}
            >
              <ChevronLeft size={15} />
            </button>
            <button aria-label="Next calendar period" onClick={() => move(1)}>
              <ChevronRight size={15} />
            </button>
          </div>
          <button
            className="planner-add"
            onClick={() => {
              const start = new Date(date);
              start.setHours(9, 0, 0, 0);
              onCreate(start);
            }}
          >
            <Plus size={14} /> Add event
          </button>
          <button className="planner-add planner-add-reminder" onClick={() => {
            const when = new Date(date);
            when.setHours(9, 0, 0, 0);
            onCreateReminder(when);
          }}><Bell size={14} /> Add reminder</button>
          <div className="planner-view" aria-label="Calendar view">
            {["Month", "Week", "Day", "Agenda"].map((value) => (
              <button
                key={value}
                aria-pressed={view === value}
                onClick={() => onView(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </header>
        {view === "Week" || view === "Day" ? (
          <div
            className={`planner-grid-scroll ${view === "Day" ? "planner-day-view" : ""}`}
            ref={scroll}
            tabIndex={0}
            aria-label="Calendar time grid"
          >
            <div
              className="planner-grid-inner"
              style={{ "--planner-days": days.length } as React.CSSProperties}
            >
              <div className="planner-day-headers">
                <div className="planner-zone" title={props.profile.timezone}>
                  {format(date, "OOOO")}
                </div>
                {days.map((day, index) => (
                  <button
                    key={day.toISOString()}
                    className={`${isSameDay(day, date) ? "selected" : ""} planner-header-${index}`}
                    aria-label={`Show ${format(day, "EEEE, MMMM d")}`}
                    aria-pressed={isSameDay(day, date)}
                    onClick={() => onDate(day)}
                  >
                    <span>{format(day, "EEE")}</span>
                    <strong>{format(day, "d")}</strong>
                  </button>
                ))}
              </div>
              {(calendars.tasks || calendars.birthdays || calendars.reminders || holidays.length > 0) && (
                <div className="planner-all-day">
                  <span>All day</span>
                  {days.map((day) => (
                    <div key={day.toISOString()}>
                      {holidays.filter((holiday) => holiday.date === format(day, "yyyy-MM-dd")).map((holiday) => (
                        <span className="planner-holiday" key={`${holiday.date}-${holiday.name}`}>{holiday.name}</span>
                      ))}
                      {props.entities
                        .filter(
                          (e) =>
                            (calendars.tasks &&
                              e.kind === "task" &&
                              e.dueAt &&
                              isSameDay(new Date(e.dueAt), day)) ||
                            (calendars.reminders &&
                              e.kind === "reminder" &&
                              e.dueAt &&
                              isSameDay(new Date(e.dueAt), day)) ||
                            (calendars.birthdays &&
                              e.kind === "person" &&
                              String(e.data.birthday || "").slice(5) ===
                                format(day, "MM-dd")),
                        )
                        .map((e) => (
                          <button key={e.id} onClick={() => props.open(e)}>
                            {e.kind === "person"
                              ? `${e.title}'s birthday`
                              : e.kind === "reminder" ? `⏰ ${e.title}` : e.title}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              )}
              <div
                className="planner-time-grid"
                style={{ height: hours.length * hourHeight }}
              >
                <div className="planner-hours">
                  {hours.map((hour) => (
                    <div key={hour} style={{ height: hourHeight }}>
                      <span>
                        {hour === 0
                          ? "12 am"
                          : hour < 12
                            ? `${hour} am`
                            : hour === 12
                              ? "12 pm"
                              : `${hour - 12} pm`}
                      </span>
                    </div>
                  ))}
                </div>
                {days.map((day) => (
                  <div className="planner-day-column" key={day.toISOString()}>
                    {hours.map((hour) => (
                      <button
                        key={hour}
                        className="planner-time-slot"
                        tabIndex={hour === 9 && isSameDay(day, date) ? 0 : -1}
                        data-day={format(day, "yyyy-MM-dd")}
                        data-hour={hour}
                        onKeyDown={(e) => {
                          const step = {
                            ArrowUp: [0, -1],
                            ArrowDown: [0, 1],
                            ArrowLeft: [-1, 0],
                            ArrowRight: [1, 0],
                          }[e.key as "ArrowUp"];
                          if (!step) return;
                          e.preventDefault();
                          const nextDay = addDays(day, step[0]);
                          const nextHour = Math.min(
                            23,
                            Math.max(0, hour + step[1]),
                          );
                          scroll.current
                            ?.querySelector<HTMLButtonElement>(
                              `[data-day="${format(nextDay, "yyyy-MM-dd")}"][data-hour="${nextHour}"]`,
                            )
                            ?.focus();
                        }}
                        style={{ top: hour * hourHeight, height: hourHeight }}
                        aria-label={`Add event on ${format(day, "EEEE, MMMM d")} at ${hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}`}
                        onClick={() => {
                          const start = new Date(day);
                          start.setHours(hour, 0, 0, 0);
                          onCreate(start);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const event = events.find(
                            (v) =>
                              v.id ===
                              e.dataTransfer.getData("crunchrr/entity"),
                          );
                          if (event) {
                            const next = new Date(day);
                            next.setHours(hour, 0, 0, 0);
                            onMove(event, next);
                          }
                        }}
                      >
                        <span className="sr-only">Add event</span>
                        <Plus size={14} />
                      </button>
                    ))}
                    {layoutCalendarEvents(visibleEvents, day).map(
                      ({ event, startMinute, endMinute, column, columns }) => (
                        <button
                          key={event.id}
                          className={`planner-event ${columns > 1 ? "event-overlap" : ""} event-${eventCategory(event)} ${active?.id === event.id ? "is-active" : ""}`}
                          style={{
                            top: (startMinute / 60) * hourHeight + 2,
                            height: Math.max(
                              40,
                              ((endMinute - startMinute) / 60) * hourHeight - 4,
                            ),
                            left: `calc(${(column / columns) * 100}% + 3px)`,
                            width: `calc(${100 / columns}% - 6px)`,
                          }}
                          title={`${event.title} · ${eventTime(event)}`}
                          aria-label={`Open ${event.title}, ${eventTime(event)}`}
                          aria-expanded={active?.id === event.id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("crunchrr/entity", event.id)
                          }
                          onClick={(e) => showEvent(event, e.currentTarget)}
                        >
                          <strong>{event.title}</strong>
                          <span>{eventTime(event)}</span>
                          {endMinute - startMinute >= 120 &&
                          columns === 1 &&
                          event.data.location ? (
                            <small>{String(event.data.location)}</small>
                          ) : null}
                          {endMinute - startMinute >= 90 &&
                            Array.isArray(event.data.participants) &&
                            event.data.participants.length > 0 && (
                              <div className="event-attendees">
                                {people
                                  .filter((p) =>
                                    (
                                      event.data.participants as string[]
                                    ).includes(p.id),
                                  )
                                  .slice(0, 3)
                                  .map((person) => (
                                    <span key={person.id} title={person.title}>
                                      {avatar(person) ? (
                                        <img src={avatar(person)} alt="" />
                                      ) : (
                                        person.title.slice(0, 1)
                                      )}
                                    </span>
                                  ))}
                              </div>
                            )}
                        </button>
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={`planner-alternative planner-${view.toLowerCase()}`}>
            <CalendarBoard
              {...props}
              entities={[
                ...visibleEvents,
                ...props.entities.filter((entity) =>
                  (calendars.reminders && entity.kind === "reminder") ||
                  (calendars.tasks && entity.kind === "task"),
                ),
              ]}
              holidays={holidays}
              date={date}
              view={view}
              onMove={(event, next) => {
                const original = new Date(String(event.data.start));
                next.setHours(original.getHours(), original.getMinutes(), 0, 0);
                onMove(event, next);
              }}
            />
          </div>
        )}
        <footer className="planner-footer">
          <span>
            {
              visibleEvents.filter((e) =>
                days.some((day) =>
                  isSameDay(new Date(String(e.data.start)), day),
                ),
              ).length
            }{" "}
            events this {view.toLowerCase()}
          </span>
          <span>Click a time to plan. Drag an event to reschedule.</span>
        </footer>
      </div>
      {selected && active && (
        <section
          className="calendar-preview"
          ref={previewRef}
          role="dialog"
          aria-label={`${selected.title} event details`}
          style={{ left: active.left, top: active.top }}
        >
          <button
            className="preview-close"
            aria-label="Close event preview"
            onClick={() => {
              setActive(null);
              origin.current?.focus();
            }}
          >
            <X size={15} />
          </button>
          <h2>{selected.title}</h2>
          <div className="preview-category">
            <span>Calendar</span>
            <b className={`category-${eventCategory(selected)}`}>
              {eventCategory(selected)}
            </b>
          </div>
          <p>
            <CalendarDays size={14} />
            {format(new Date(String(selected.data.start)), "EEE, MMM d, yyyy")}
          </p>
          <p>
            <Clock3 size={14} />
            {eventTime(selected)}
          </p>
          {selected.data.location ? (
            <p>
              <MapPin size={14} />
              {String(selected.data.location)}
            </p>
          ) : null}
          {typeof selected.data.meetingUrl === "string" && selected.data.meetingUrl.startsWith("https://") && (
            <a className="preview-meeting" href={selected.data.meetingUrl} target="_blank" rel="noopener noreferrer"><Video size={14} /> Join meeting <ArrowUpRight size={14} /></a>
          )}
          {selected.description && (
            <p className="preview-description">{selected.description}</p>
          )}
          <button
            className="preview-favorite"
            aria-pressed={selected.tags.includes("favorite")}
            onClick={() => onFavorite(selected)}
          >
            <Star
              size={14}
              fill={
                selected.tags.includes("favorite") ? "currentColor" : "none"
              }
            />
            {selected.tags.includes("favorite")
              ? "Saved to favorites"
              : "Save to favorites"}
          </button>
          <button
            className="preview-edit"
            onClick={() => {
              setActive(null);
              props.open(selected);
            }}
          >
            View & edit event <ArrowUpRight size={14} />
          </button>
        </section>
      )}
    </section>
  );
}
