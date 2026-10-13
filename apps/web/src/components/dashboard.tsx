"use client";
import { useState } from "react";
import {
  CalendarDays,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  Check,
  Plus,
  Footprints,
  Moon,
  Heart,
  Droplet,
  Flame,
  Weight,
  Wallet,
  Target,
  SquareCheck,
  Pill,
  Sun,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Users,
  House,
  Package,
  Link2,
  Smile,
  Sparkles,
  Shield,
  Plane,
  Car,
  Utensils,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  getDay,
} from "date-fns";
import {
  type Entity,
  type EntityKind,
  type Profile,
} from "@crunchrr/validation";
import {
  numeric,
  stringValue,
  money,
  dayKey,
  dashboardStats,
} from "@crunchrr/utils";
import { kindIcons, kindLabel } from "@/lib/modules";
import { Button } from "./ui/button";
export interface DashboardProps {
  entities: Entity[];
  profile: Profile;
  open: (e: Entity) => void;
  add: (kind: EntityKind) => void;
  navigate: (path: string) => void;
  toggle: (e: Entity) => void;
  update: (e: Entity, data: Record<string, unknown>) => void;
  summary?: {
    analytics?:import('@crunchrr/validation').WorkAnalytics;
    today: { kind: string; total: number; completed: number; amount: string }[];
    finance: { kind: string; category: string; amount: string }[];
  };
}
const categoryColors = [
  "#6d3df5",
  "#8c7aff",
  "#3bb9ef",
  "#ffb54b",
  "#ff607c",
  "#ad77f9",
  "#14c9b1",
];
export function IconTile({
  kind,
  className = "",
}: {
  kind: EntityKind;
  className?: string;
}) {
  const Icon = kindIcons[kind];
  return (
    <span className={`icon-tile tile-${kind} ${className}`}>
      <Icon size={21} />
    </span>
  );
}
export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="card-header">
        <h2>{title}</h2>
        {action && (
          <button className="text-button" onClick={action}>
            View all <ArrowRight size={13} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
export function Empty({
  kind,
  add,
}: {
  kind: EntityKind;
  add: (k: EntityKind) => void;
}) {
  return (
    <div className="empty">
      <IconTile kind={kind} />
      <p>No {kindLabel(kind).toLowerCase()} records yet.</p>
      <button className="text-button" onClick={() => add(kind)}>
        <Plus size={14} /> Create {kindLabel(kind).toLowerCase()}
      </button>
    </div>
  );
}
export function MiniCalendar({
  entities,
  onSelect,
}: {
  entities: Entity[];
  onSelect?: (date: Date) => void;
}) {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
  return (
    <div className="mini-calendar">
      <div className="month-header">
        <h2>{format(month, "MMMM yyyy")}</h2>
        <div>
          <button
            aria-label="Previous month"
            className="icon-button"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="small-button"
            onClick={() => {
              setMonth(new Date());
              setSelected(new Date());
              onSelect?.(new Date());
            }}
          >
            Today
          </button>
          <button
            aria-label="Next month"
            className="icon-button"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`day-${i}`} className="weekday">
            {d}
          </span>
        ))}
        {Array.from({ length: getDay(startOfMonth(month)) }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((d) => {
          const event = entities.some(
            (e) =>
              e.kind === "event" &&
              isSameDay(new Date(stringValue(e.data, "start")), d),
          );
          return (
            <button
              key={d.toISOString()}
              className={`calendar-day ${isSameDay(d, selected) ? "selected" : ""}`}
              aria-label={format(d, "MMMM d, yyyy")}
              aria-pressed={isSameDay(d, selected)}
              onClick={() => {
                setSelected(d);
                onSelect?.(d);
              }}
            >
              {format(d, "d")}
              {event && <i />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function TaskList({
  entities,
  open,
  toggle,
  add,
  full = false,
}: Pick<DashboardProps, "entities" | "open" | "toggle" | "add"> & {
  full?: boolean;
}) {
  const [tab, setTab] = useState("Today");
  const now = new Date();
  const today = dayKey();
  const tasks = entities.filter((e) => e.kind === "task");
  const matches = (e: Entity, filter: string) =>
    filter === "All" ||
    (filter === "Completed"
      ? e.status === "completed"
      : filter === "Overdue"
        ? e.status !== "completed" &&
          e.dueAt &&
          new Date(e.dueAt) < now &&
          dayKey(new Date(e.dueAt)) !== today
        : filter === "Upcoming"
          ? e.dueAt && dayKey(new Date(e.dueAt)) > today
          : !e.dueAt || dayKey(new Date(e.dueAt)) === today);
  const filtered = tasks.filter((e) => matches(e, tab));
  return (
    <>
      <div className="tabs">
        {(full
          ? ["Today", "Upcoming", "Overdue", "Completed", "All"]
          : ["Today", "Upcoming", "Overdue"]
        ).map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
            <span>{tasks.filter((e) => matches(e, t)).length}</span>
          </button>
        ))}
      </div>
      <div className="task-list">
        {filtered.slice(0, full ? 100 : 7).map((e) => (
          <div className="task-row" key={e.id}>
            <button
              className={`check-box ${e.status === "completed" ? "checked" : ""}`}
              aria-label={`${e.status === "completed" ? "Reopen" : "Complete"} ${e.title}`}
              aria-pressed={e.status === "completed"}
              onClick={() => toggle(e)}
            >
              {e.status === "completed" && <Check size={13} />}
            </button>
            <button
              className={`task-title ${e.status === "completed" ? "done" : ""}`}
              onClick={() => open(e)}
            >
              {e.title}
            </button>
            {["high", "urgent"].includes(e.priority) && (
              <span className="badge badge-danger">{e.priority}</span>
            )}
            <span className="task-date">
              {e.dueAt ? format(new Date(e.dueAt), "MMM d") : "Inbox"}
            </span>
            <button
              aria-label={`Open ${e.title}`}
              className="row-more"
              onClick={() => open(e)}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        ))}
        {!filtered.length && <Empty kind="task" add={add} />}
      </div>
    </>
  );
}
export function Schedule({
  entities,
  open,
  add,
  date = new Date(),
}: Pick<DashboardProps, "entities" | "open" | "add"> & { date?: Date }) {
  const events = entities
    .filter(
      (e) =>
        e.kind === "event" &&
        isSameDay(new Date(stringValue(e.data, "start")), date),
    )
    .sort((a, b) => String(a.data.start).localeCompare(String(b.data.start)));
  const icons = [GraduationCap, Dumbbell, Users, BookOpen, House];
  return (
    <div className="schedule-list">
      {events.map((e, i) => {
        const Icon = icons[i % icons.length]!;
        const duration =
          (new Date(String(e.data.end)).getTime() -
            new Date(String(e.data.start)).getTime()) /
          60000;
        return (
          <button className="schedule-row" key={e.id} onClick={() => open(e)}>
            <span className="timeline-dot" />
            <time>{format(new Date(String(e.data.start)), "h:mm a")}</time>
            <span className={`event-icon event-color-${i % 5}`}>
              <Icon size={22} />
            </span>
            <span className="event-info">
              <strong>{e.title}</strong>
              <small>
                <MapPin size={11} />
                {String(e.data.location || "No location")}
              </small>
            </span>
            <span className="duration">
              {duration >= 60
                ? `${Math.floor(duration / 60)}h ${duration % 60 ? `${duration % 60}m` : ""}`
                : `${duration}m`}
            </span>
          </button>
        );
      })}
      {!events.length && <Empty kind="event" add={add} />}
    </div>
  );
}
export function FinanceCard({
  entities,
  summary,
}: Pick<DashboardProps, "entities" | "summary">) {
  const expenses = entities.filter((e) => e.kind === "expense");
  const chart =
    summary?.finance
      .filter((e) => e.kind === "expense")
      .map((e) => ({ name: e.category, value: Number(e.amount) })) ||
    Object.entries(
      expenses.reduce<Record<string, number>>((acc, e) => {
        const category = String(e.data.category || "Other");
        acc[category] = (acc[category] || 0) + numeric(e.data, "amount");
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));
  const total = chart.reduce((s, e) => s + e.value, 0);
  const income =
    summary?.finance
      .filter((e) => e.kind === "income")
      .reduce((s, e) => s + Number(e.amount), 0) ??
    entities
      .filter((e) => e.kind === "income")
      .reduce((s, e) => s + numeric(e.data, "amount"), 0);
  return (
    <>
      <div className="finance-stats">
        <div>
          <strong>{money(total)}</strong>
          <span>Total expenses</span>
        </div>
        <div>
          <strong>{money(income)}</strong>
          <span>
            Total income <ArrowUpRight size={13} />
          </span>
        </div>
        <span className="badge">This month</span>
      </div>
      <div className="finance-chart">
        <div className="donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chart}
                innerRadius="66%"
                outerRadius="96%"
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {chart.map((e, i) => (
                  <Cell
                    key={e.name}
                    fill={categoryColors[i % categoryColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <strong>{money(total)}</strong>
            <small>Expenses</small>
          </div>
        </div>
        <div className="chart-legend">
          {chart.slice(0, 7).map((e, i) => (
            <div key={e.name}>
              <i
                style={{
                  background: categoryColors[i % categoryColors.length],
                }}
              />
              <span>{e.name}</span>
              <strong>{money(e.value)}</strong>
              <small>{total ? Math.round((e.value / total) * 100) : 0}%</small>
            </div>
          ))}
          {!chart.length && (
            <p className="muted">Add a transaction to see your spending.</p>
          )}
        </div>
      </div>
    </>
  );
}
export function HealthCard({
  entities,
  add,
}: Pick<DashboardProps, "entities" | "add">) {
  const definitions = [
    { metric: "steps", label: "Steps", icon: Footprints, tint: "blue" },
    { metric: "sleep", label: "Sleep", icon: Moon, tint: "purple" },
    { metric: "heart_rate", label: "Heart rate", icon: Heart, tint: "pink" },
    { metric: "weight", label: "Weight", icon: Weight, tint: "blue" },
    { metric: "water", label: "Water", icon: Droplet, tint: "blue" },
    { metric: "calories", label: "Calories", icon: Flame, tint: "orange" },
  ];
  return (
    <>
      <div className="health-grid">
        {definitions.map((d) => {
          const e = entities
            .filter((e) => e.kind === "health" && e.data.metric === d.metric)
            .sort((a, b) =>
              String(b.data.recordedAt).localeCompare(
                String(a.data.recordedAt),
              ),
            )[0];
          return (
            <button
              key={d.metric}
              onClick={() => add("health")}
              className="health-metric"
            >
              <span className={`metric-icon ${d.tint}`}>
                <d.icon size={21} />
              </span>
              <span>
                <strong>
                  {e
                    ? `${numeric(e.data, "value").toLocaleString()} ${e.data.unit === "steps" ? "" : e.data.unit || ""}`
                    : "—"}
                </strong>
                <small>{d.label}</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mood-header">
        <h3>Mood & energy</h3>
        <span className="muted">Daily check-in</span>
      </div>
      <div className="mood-row">
        {[1, 2, 3, 4, 5].map((m, i) => (
          <button
            aria-label={`Log mood ${m} of 5`}
            key={m}
            style={{
              background: [
                "#ffdde3",
                "#ffe6c1",
                "#ffeaa5",
                "#a6f3d4",
                "#6ce4c3",
              ][i],
            }}
            onClick={() => add("wellbeing")}
          >
            <Smile size={20} />
          </button>
        ))}
        <button className="text-button" onClick={() => add("wellbeing")}>
          How are you?
        </button>
      </div>
    </>
  );
}
export function Medicines({
  entities,
  update,
  open,
  add,
  profile,
}: Pick<DashboardProps, "entities" | "update" | "open" | "add" | "profile">) {
  const today = dayKey(new Date(), profile.timezone);
  const meds = entities.filter((e) => e.kind === "medicine");
  const low = meds.find(
    (e) =>
      numeric(e.data, "quantity") /
        Math.max(1, numeric(e.data, "dailyConsumption")) <=
      7,
  );
  return (
    <>
      <div className="medicine-list">
        {meds.slice(0, 3).map((e) => {
          const taken =
            Array.isArray(e.data.takenDates) &&
            e.data.takenDates.includes(today);
          return (
            <div className="medicine-row" key={e.id}>
              <button
                className={`round-check ${taken ? "taken" : ""}`}
                aria-label={`${taken ? "Undo" : "Mark"} ${e.title} taken`}
                onClick={() => {
                  const dates = Array.isArray(e.data.takenDates)
                    ? (e.data.takenDates as string[])
                    : [];
                  update(e, {
                    takenDates: taken
                      ? dates.filter((d) => d !== today)
                      : [...dates, today],
                  });
                }}
              >
                {taken && <Check size={15} />}
              </button>
              <button className="medicine-title" onClick={() => open(e)}>
                <strong>{e.title}</strong>
                <small>
                  {String(e.data.dosage)} ·{" "}
                  {e.dueAt
                    ? format(new Date(e.dueAt), "h:mm a")
                    : "Unscheduled"}
                </small>
              </button>
              <span
                className={`badge ${taken ? "badge-success" : "badge-danger"}`}
              >
                {taken ? "Taken" : "Pending"}
              </span>
            </div>
          );
        })}
        {!meds.length && <Empty kind="medicine" add={add} />}
      </div>
      <button className="text-button centered" onClick={() => add("medicine")}>
        <Plus size={13} /> Add medicine
      </button>
      {low && (
        <button className="inventory-alert" onClick={() => open(low)}>
          <span className="alert-symbol">!</span>
          <span>
            <strong>Inventory reminder</strong>
            <small>
              {low.title} ·{" "}
              {Math.floor(
                numeric(low.data, "quantity") /
                  Math.max(1, numeric(low.data, "dailyConsumption")),
              )}{" "}
              days remaining
            </small>
          </span>
          <ArrowRight size={16} />
        </button>
      )}
    </>
  );
}
export function HabitCard({
  entities,
  update,
  profile,
  add,
}: Pick<DashboardProps, "entities" | "update" | "profile" | "add">) {
  const today = dayKey(new Date(), profile.timezone);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d;
  });
  const habits = entities.filter((e) => e.kind === "habit");
  return (
    <div className="habit-table">
      <div className="habit-table-head">
        <span>Last 7 days</span>
        {days.map((d) => (
          <small key={d.toISOString()}>{format(d, "EEEEE")}</small>
        ))}
      </div>
      {habits.slice(0, 5).map((e, i) => {
        const dates = Array.isArray(e.data.completedDates)
          ? (e.data.completedDates as string[])
          : [];
        return (
          <div className="habit-row" key={e.id}>
            <span>
              <i className={`habit-symbol habit-color-${i % 3}`} />
              {e.title}
            </span>
            {days.map((d) => {
              const key = dayKey(d, profile.timezone),
                done = dates.includes(key);
              return (
                <button
                  key={key}
                  className={`habit-dot ${done ? "complete" : ""}`}
                  aria-label={`${e.title}, ${format(d, "MMM d")}: ${done ? "completed" : "not completed"}`}
                  aria-pressed={done}
                  disabled={key !== today}
                  onClick={() =>
                    update(e, {
                      completedDates: done
                        ? dates.filter((v) => v !== today)
                        : [...dates, today],
                    })
                  }
                >
                  {done && <Check size={9} />}
                </button>
              );
            })}
          </div>
        );
      })}
      {!habits.length && <Empty kind="habit" add={add} />}
    </div>
  );
}
export function Dashboard(props: DashboardProps) {
  const { entities, profile, open, add, navigate, summary } = props;
  const stats = dashboardStats(entities, profile.timezone);
  const count = (kind: string) => summary?.today.find((e) => e.kind === kind);
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: profile.timezone,
    }).format(now),
  );
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const goals = entities.filter((e) => e.kind === "goal");
  const percent = goals.length
    ? Math.round(
        (goals.reduce(
          (s, e) =>
            s +
            Math.min(
              1,
              numeric(e.data, "current") /
                Math.max(1, numeric(e.data, "target")),
            ),
          0,
        ) /
          goals.length) *
          100,
      )
    : 0;
  const quick: EntityKind[] = [
    "task",
    "event",
    "note",
    "expense",
    "medicine",
    "health",
    "order",
    "bill",
    "document",
    "habit",
    "goal",
    "project",
  ];
  const tasks = count("task")?.total ?? stats.tasks,
    completed = count("task")?.completed ?? stats.completed;
  const kpis = [
    {
      label: "Tasks",
      value: `${completed} / ${tasks}`,
      kind: "task" as const,
      progress: tasks ? (completed / tasks) * 100 : 0,
      detail: "completed",
    },
    {
      label: "Events",
      value: `${count("event")?.total ?? stats.events} today`,
      kind: "event" as const,
      detail: "Your daily schedule",
    },
    {
      label: "Expenses",
      value: money(
        Number(count("expense")?.amount ?? stats.expenses),
        profile.currency,
      ),
      kind: "expense" as const,
      detail: "spent today",
    },
    {
      label: "Steps",
      value: stats.steps.toLocaleString(),
      kind: "health" as const,
      detail: "steps logged today",
    },
    {
      label: "Medicines",
      value: `${stats.taken} / ${count("medicine")?.total ?? stats.medicines}`,
      kind: "medicine" as const,
      progress: stats.medicines ? (stats.taken / stats.medicines) * 100 : 0,
      detail: "taken today",
    },
    {
      label: "Goals",
      value: `${count("goal")?.total ?? stats.goals} active`,
      kind: "goal" as const,
      progress: percent,
      detail: `${percent}% average progress`,
    },
  ];
  const hidden = (id: string) => profile.widgets.includes(`hide:${id}`);
  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <section className="hero">
          <div className="hero-copy">
            <p>{greeting},</p>
            <h1>
              {profile.name}
              <Sun className="greeting-sun" size={31} />
            </h1>
            <p className="hero-subtitle">
              Everything important,
              <br />
              in one place.
            </p>
            <div className="hero-actions">
              <Button onClick={() => navigate("assistant")}>
                <Sparkles size={14} /> Plan my day
              </Button>
              <Button variant="secondary" onClick={() => navigate("tasks")}>
                Focus
              </Button>
              <Button variant="secondary" onClick={() => navigate("finance")}>
                Review finances
              </Button>
              <Button variant="secondary" onClick={() => navigate("health")}>
                Health check
              </Button>
            </div>
          </div>
          <div className="hero-clock">
            <span>
              {new Intl.DateTimeFormat("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: profile.timezone,
              }).format(now)}
            </span>
            <strong>
              {new Intl.DateTimeFormat("en", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: profile.timezone,
              }).format(now)}
            </strong>
            <span className="hero-progress">
              <span>
                {tasks ? Math.round((completed / tasks) * 100) : 0}% of today’s
                tasks
              </span>
              <i>
                <b
                  style={{ width: `${tasks ? (completed / tasks) * 100 : 0}%` }}
                />
              </i>
            </span>
          </div>
        </section>
        <div className="kpi-grid">
          {kpis.map((k) => (
            <button
              key={k.kind}
              className="kpi-card"
              onClick={() =>
                navigate(
                  k.kind === "event"
                    ? "calendar"
                    : k.kind === "task"
                      ? "tasks"
                      : k.kind === "expense"
                        ? "finance"
                        : k.kind === "health"
                          ? "health"
                          : k.kind === "medicine"
                            ? "medicines"
                            : "goals",
                )
              }
            >
              <div className="kpi-top">
                <IconTile kind={k.kind} />
                <div>
                  <span>{k.label}</span>
                  <strong>{k.value}</strong>
                </div>
              </div>
              {k.progress !== undefined ? (
                <div className="kpi-progress">
                  <i>
                    <b style={{ width: `${k.progress}%` }} />
                  </i>
                  <small>{Math.round(k.progress)}%</small>
                </div>
              ) : (
                <small className="kpi-detail">{k.detail}</small>
              )}
            </button>
          ))}
        </div>
        <div className="bento-grid">
          {!hidden("schedule") && (
            <Card
              title="Today’s schedule"
              action={() => navigate("calendar")}
              className="bento-half schedule-card"
            >
              <Schedule {...props} />
            </Card>
          )}
          {!hidden("tasks") && (
            <Card
              title="Tasks"
              action={() => navigate("tasks")}
              className="bento-half"
            >
              <TaskList {...props} />
            </Card>
          )}
          {!hidden("finance") && (
            <Card
              title="Finance overview"
              action={() => navigate("finance")}
              className="bento-third"
            >
              <FinanceCard {...props} />
            </Card>
          )}
          {!hidden("health") && (
            <Card
              title="Health overview"
              action={() => navigate("health")}
              className="bento-third"
            >
              <HealthCard {...props} />
            </Card>
          )}
          {!hidden("medicines") && (
            <Card
              title="Medicines today"
              action={() => navigate("medicines")}
              className="bento-third"
            >
              <Medicines {...props} />
            </Card>
          )}
          {!hidden("orders") && (
            <Card
              title="Online orders"
              action={() => navigate("orders")}
              className="bento-third compact-card"
            >
              <div className="compact-list">
                {entities
                  .filter((e) => e.kind === "order")
                  .slice(0, 3)
                  .map((e) => (
                    <button
                      key={e.id}
                      className="compact-row"
                      onClick={() => open(e)}
                    >
                      <span className="store-logo">
                        {String(e.data.store).slice(0, 1)}
                      </span>
                      <span>
                        <strong>{String(e.data.store)}</strong>
                        <small>{e.title}</small>
                        <small className="blue-text">
                          {e.dueAt
                            ? `Arriving ${format(new Date(e.dueAt), "MMM d")}`
                            : e.status}
                        </small>
                      </span>
                      <span className="badge">
                        {e.status.replaceAll("_", " ")}
                      </span>
                    </button>
                  ))}
              </div>
              {!entities.some((e) => e.kind === "order") && (
                <Empty kind="order" add={add} />
              )}
            </Card>
          )}
          {!hidden("bills") && (
            <Card
              title="Subscriptions & bills"
              action={() => navigate("bills")}
              className="bento-third compact-card"
            >
              <div className="compact-list">
                {entities
                  .filter((e) => ["bill", "subscription"].includes(e.kind))
                  .sort((a, b) => (a.dueAt || "").localeCompare(b.dueAt || ""))
                  .slice(0, 4)
                  .map((e) => (
                    <button
                      key={e.id}
                      className="bill-row"
                      onClick={() => open(e)}
                    >
                      <IconTile kind={e.kind} />
                      <strong>{e.title}</strong>
                      <small>{money(numeric(e.data, "amount"))}</small>
                      <span className="badge badge-danger">
                        {e.dueAt
                          ? format(new Date(e.dueAt), "MMM d")
                          : "No date"}
                      </span>
                    </button>
                  ))}
              </div>
              {!entities.some(
                (e) => e.kind === "bill" || e.kind === "subscription",
              ) && <Empty kind="bill" add={add} />}
            </Card>
          )}
          {!hidden("habits") && (
            <Card
              title="Habit tracker"
              action={() => navigate("habits")}
              className="bento-third compact-card"
            >
              <HabitCard {...props} />
            </Card>
          )}
          {!hidden("goals") && (
            <Card
              title="Goals in motion"
              action={() => navigate("goals")}
              className="bento-third compact-card"
            >
              {goals.slice(0, 2).map((e) => {
                const p = Math.min(
                  100,
                  (numeric(e.data, "current") /
                    Math.max(1, numeric(e.data, "target"))) *
                    100,
                );
                return (
                  <button
                    className="goal-row"
                    key={e.id}
                    onClick={() => open(e)}
                  >
                    <IconTile kind="goal" />
                    <span>
                      <strong>{e.title}</strong>
                      <small>
                        {numeric(e.data, "current").toLocaleString()} /{" "}
                        {numeric(e.data, "target").toLocaleString()}{" "}
                        {String(e.data.unit)}
                      </small>
                      <i className="progress-track">
                        <b style={{ width: `${p}%` }} />
                      </i>
                    </span>
                    <strong>{Math.round(p)}%</strong>
                  </button>
                );
              })}
              {!goals.length && <Empty kind="goal" add={add} />}
            </Card>
          )}
          {!hidden("meals") && (
            <Card
              title="Upcoming meals"
              action={() => navigate("meals")}
              className="bento-third compact-card"
            >
              {entities
                .filter((e) => e.kind === "meal")
                .sort((a, b) => (a.dueAt || "").localeCompare(b.dueAt || ""))
                .slice(0, 4)
                .map((e) => (
                  <button
                    key={e.id}
                    className="meal-row"
                    onClick={() => open(e)}
                  >
                    <Utensils size={19} />
                    <span>
                      <strong>{String(e.data.category)}</strong>
                      <small>{e.title}</small>
                    </span>
                    <time>
                      {e.dueAt ? format(new Date(e.dueAt), "h:mm a") : ""}
                    </time>
                  </button>
                ))}
              {!entities.some((e) => e.kind === "meal") && (
                <Empty kind="meal" add={add} />
              )}
            </Card>
          )}
          <Card
            title="Your life, connected"
            action={() => navigate("projects")}
            className="bento-third compact-card"
          >
            <div className="life-links">
              {[
                { kind: "trip" as const, icon: Plane },
                { kind: "document" as const, icon: Shield },
                { kind: "vehicle" as const, icon: Car },
              ].map(({ kind, icon: Icon }) => {
                const e = entities.find((e) => e.kind === kind);
                return (
                  <button key={kind} onClick={() => (e ? open(e) : add(kind))}>
                    <span className="metric-icon purple">
                      <Icon size={18} />
                    </span>
                    <span>
                      <strong>
                        {e?.title || `Add ${kindLabel(kind).toLowerCase()}`}
                      </strong>
                      <small>
                        {kind === "trip"
                          ? "Travel"
                          : kind === "document"
                            ? "Life Vault"
                            : "Vehicles"}
                      </small>
                    </span>
                    <Link2 size={14} />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
        <p className="workspace-footer">
          <span className="status-dot" />
          All your little things. One connected life.
        </p>
      </div>
      <aside className="context-panel">
        <section className="card calendar-card">
          <MiniCalendar
            entities={entities}
            onSelect={() => navigate("calendar")}
          />
        </section>
        <Card title="Quick add" className="quick-add-card">
          <div className="quick-grid">
            {quick.map((kind) => (
              <button key={kind} onClick={() => add(kind)}>
                <IconTile kind={kind} />
                <span>
                  {kind === "health" ? "Health record" : kindLabel(kind)}
                </span>
              </button>
            ))}
          </div>
        </Card>
        <Card
          title="Upcoming events"
          action={() => navigate("calendar")}
          className="upcoming-card"
        >
          {entities
            .filter(
              (e) =>
                e.kind === "event" && new Date(String(e.data.start)) >= now,
            )
            .sort((a, b) =>
              String(a.data.start).localeCompare(String(b.data.start)),
            )
            .slice(0, 4)
            .map((e) => (
              <button
                className="upcoming-row"
                key={e.id}
                onClick={() => open(e)}
              >
                <IconTile kind="event" />
                <span>
                  <strong>{e.title}</strong>
                  <small>
                    {format(new Date(String(e.data.start)), "MMM d · h:mm a")}
                  </small>
                </span>
              </button>
            ))}
          {!entities.some(
            (e) => e.kind === "event" && new Date(String(e.data.start)) >= now,
          ) && <Empty kind="event" add={add} />}
        </Card>
        <section className="assistant-card">
          <Sparkles size={25} />
          <h2>
            A little clarity,
            <br />a lot less chaos.
          </h2>
          <p>Your assistant connects the dots, so you can focus on living.</p>
          <Button onClick={() => navigate("assistant")}>
            Ask crunchrr <ArrowRight size={14} />
          </Button>
        </section>
      </aside>
    </div>
  );
}
