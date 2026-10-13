"use client";
import { useState, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Paperclip,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  List,
  LayoutGrid,
  CalendarDays,
  GitBranch,
  Focus,
  SlidersHorizontal,
  CheckCircle2,
  Timer,
  Flame,
  TrendingUp,
  SquareCheck,
  Briefcase,
  Heart,
  User,
  BookOpen,
  DollarSign,
  Home,
  Plus,
  Check,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  getDay,
  isAfter,
  isBefore,
  startOfDay,
  isThisWeek,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { type Entity, type EntityKind, type Profile } from "@crunchrr/validation";
import { numeric, stringValue } from "@crunchrr/utils";

export interface TaskPageProps {
  entities: Entity[];
  moduleItems: Entity[];
  profile: Profile;
  open: (e: Entity) => void;
  add: (kind: EntityKind) => void;
  navigate: (path: string) => void;
  toggle: (e: Entity) => void;
  update: (e: Entity, data: Record<string, unknown>) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const today = startOfDay(new Date());

function isToday(d: Date) {
  return isSameDay(d, today);
}

function isOverdue(e: Entity) {
  return (
    e.dueAt &&
    isBefore(startOfDay(new Date(e.dueAt)), today) &&
    e.status !== "completed"
  );
}

function isUpcoming(e: Entity) {
  return e.dueAt && isAfter(startOfDay(new Date(e.dueAt)), today);
}

function isTodayTask(e: Entity) {
  if (!e.dueAt) return false;
  return isToday(new Date(e.dueAt));
}

function isInbox(e: Entity) {
  return e.status === "inbox" || (!e.dueAt && e.status !== "completed");
}

function catClass(tag?: string) {
  const map: Record<string, string> = {
    Work: "cat-work",
    Health: "cat-health",
    Personal: "cat-personal",
    Study: "cat-study",
    Finance: "cat-finance",
    Home: "cat-home",
  };
  return tag ? (map[tag] ?? "cat-default") : "cat-default";
}

function priClass(p: string) {
  const map: Record<string, string> = {
    urgent: "pri-urgent",
    high: "pri-high",
    medium: "pri-medium",
    low: "pri-low",
  };
  return map[p] ?? "pri-low";
}

function catIcon(tag?: string) {
  const size = 11;
  switch (tag) {
    case "Work":
      return <Briefcase size={size} />;
    case "Health":
      return <Heart size={size} />;
    case "Personal":
      return <User size={size} />;
    case "Study":
      return <BookOpen size={size} />;
    case "Finance":
      return <DollarSign size={size} />;
    case "Home":
      return <Home size={size} />;
    default:
      return <SquareCheck size={size} />;
  }
}

function fmtDuration(mins: number) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function fmtTime(iso: string) {
  try {
    return format(new Date(iso), "h:mm a");
  } catch {
    return "";
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  Work: "#3b82f6",
  Health: "#22c55e",
  Personal: "#ec4899",
  Study: "#0ea5e9",
  Finance: "#eab308",
  Home: "#a855f7",
};

// ─── Stat Cards ─────────────────────────────────────────────────────────────

function Sparkline({
  bars,
  color,
}: {
  bars: number[];
  color: string;
}) {
  const max = Math.max(...bars, 1);
  return (
    <div className="task-stat-sparkline">
      {bars.map((v, i) => (
        <span
          key={i}
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: color,
            opacity: 0.5 + (i / bars.length) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

function RingProgress({ pct, color }: { pct: number; color: string }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="task-ring" style={{ position: "absolute", right: 14, bottom: 14 }}>
      <svg width={44} height={44} viewBox="0 0 44 44">
        <circle cx={22} cy={22} r={r} fill="none" stroke="#e5e7eb" strokeWidth={4} />
        <circle
          cx={22}
          cy={22}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <strong style={{ color }}>{pct}%</strong>
    </div>
  );
}

// Simple organic blob SVG for card background decoration
function BlobArt({ color }: { color: string }) {
  return (
    <svg
      className="stat-blob"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill={color}
        d="M42.7,-62.9C54.3,-54.5,62.1,-40.8,67.3,-26.1C72.5,-11.4,74.9,4.3,70.6,18.4C66.3,32.5,55.3,45,42.1,53.9C28.9,62.8,13.5,68.1,-2.4,71.2C-18.4,74.3,-35.5,75.3,-48.7,68C-62,60.7,-71.4,45.2,-74.4,29C-77.4,12.8,-73.9,-4.1,-67.4,-18.8C-60.9,-33.5,-51.4,-46,-39.3,-54.6C-27.3,-63.3,-12.6,-68.2,1.8,-70.7C16.3,-73.1,31.1,-71.3,42.7,-62.9Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  sub: string;
  blobColor: string;
  sparkBars?: number[];
  sparkColor?: string;
  ringPct?: number;
  ringColor?: string;
}
function StatCard({
  icon,
  iconBg,
  title,
  value,
  sub,
  blobColor,
  sparkBars,
  sparkColor,
  ringPct,
  ringColor,
}: StatCardProps) {
  return (
    <div className="task-stat-card">
      <BlobArt color={blobColor} />
      <div className="task-stat-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <span className="task-stat-title">{title}</span>
      <span className="task-stat-value">{value}</span>
      <span className="task-stat-sub">{sub}</span>
      {sparkBars && sparkColor && (
        <Sparkline bars={sparkBars} color={sparkColor} />
      )}
      {ringPct !== undefined && ringColor && (
        <RingProgress pct={ringPct} color={ringColor} />
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

type FilterKey =
  | "all"
  | "today"
  | "upcoming"
  | "overdue"
  | "completed"
  | "inbox"
  | "urgent"
  | "high"
  | "medium"
  | "low"
  | string;

interface SidebarProps {
  tasks: Entity[];
  active: FilterKey;
  onSelect: (k: FilterKey) => void;
  todayCount: number;
  upcomingCount: number;
  overdueCount: number;
  completedCount: number;
  inboxCount: number;
}

function TaskSidebar({
  tasks,
  active,
  onSelect,
  todayCount,
  upcomingCount,
  overdueCount,
  completedCount,
  inboxCount,
}: SidebarProps) {
  const priorities = [
    { key: "urgent", label: "Urgent", color: "#ef4444" },
    { key: "high", label: "High", color: "#f97316" },
    { key: "medium", label: "Medium", color: "#eab308" },
    { key: "low", label: "Low", color: "#9ca3af" },
  ];

  const categories = ["Work", "Personal", "Health", "Study", "Finance", "Home"];
  const catCounts: Record<string, number> = {};
  categories.forEach((c) => {
    catCounts[c] = tasks.filter((t) => t.tags.includes(c)).length;
  });
  const priorityCounts: Record<string, number> = {};
  priorities.forEach((p) => {
    priorityCounts[p.key] = tasks.filter((t) => t.priority === p.key).length;
  });

  return (
    <aside className="task-sidebar">
      {/* Filters */}
      <div className="task-filter-section">
        <div className="task-filter-heading">
          <SlidersHorizontal size={10} />
          Filters
        </div>
        {[
          { key: "all", label: "All", count: tasks.length },
          { key: "today", label: "Today", count: todayCount },
          { key: "upcoming", label: "Upcoming", count: upcomingCount },
          {
            key: "overdue",
            label: "Overdue",
            count: overdueCount,
            danger: true,
          },
          { key: "completed", label: "Completed", count: completedCount },
          { key: "inbox", label: "Inbox", count: inboxCount },
        ].map(({ key, label, count, danger }) => (
          <button
            key={key}
            className={`task-filter-item ${active === key ? "active" : ""} ${danger ? "overdue-filter" : ""}`}
            onClick={() => onSelect(key as FilterKey)}
          >
            {label}
            <span className="filter-count">{count}</span>
          </button>
        ))}
      </div>

      {/* Priorities */}
      <div className="task-filter-section">
        <div className="task-filter-heading">Priority</div>
        {priorities.map(({ key, label, color }) => (
          <button
            key={key}
            className={`task-filter-item ${active === key ? "active" : ""}`}
            onClick={() => onSelect(key as FilterKey)}
          >
            <span className="priority-dot" style={{ background: color }} />
            {label}
            <span className="filter-count">{priorityCounts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="task-filter-section">
        <div className="task-filter-heading">Categories</div>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`task-filter-item ${active === cat ? "active" : ""}`}
            onClick={() => onSelect(cat)}
          >
            <span className="task-row-icon" style={{ color: CATEGORY_COLORS[cat] ?? "#9ca3af" }}>
              {catIcon(cat)}
            </span>
            {cat}
            <span className="filter-count">{catCounts[cat] ?? 0}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

// ─── Task Row ────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Entity;
  onToggle: () => void;
  onOpen: () => void;
}

function TaskRow({ task, onToggle, onOpen }: TaskRowProps) {
  const done = task.status === "completed";
  const category = task.tags.find((t) =>
    ["Work", "Personal", "Health", "Study", "Finance", "Home"].includes(t),
  );
  const durationMins = numeric(task.data, "estimatedMinutes") || numeric(task.data, "trackedMinutes");
  const attachments = numeric(task.data, "attachments");
  const comments = numeric(task.data, "comments");
  const isHighPriority =
    task.priority === "urgent" || task.priority === "high";

  return (
    <div className="task-row-rich">
      {/* Checkbox */}
      <button
        className={`check-box ${done ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
        style={{ flexShrink: 0 }}
      >
        {done && <Check size={9} strokeWidth={3} />}
      </button>

      {/* Icon */}
      <span className="task-row-icon">{catIcon(category)}</span>

      {/* Title + time */}
      <div className="task-row-title-wrap">
        <button className="task-row-title-text" onClick={onOpen} style={{ background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}>
          <span className={done ? "task-title done" : ""}>{task.title}</span>
        </button>
        {task.dueAt && (
          <span className="task-row-time">
            <Clock size={8} />
            {fmtTime(task.dueAt)}
            {stringValue(task.data, "endTime") && (
              <> – {fmtTime(stringValue(task.data, "endTime"))}</>
            )}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="task-row-badges">
        {category && (
          <span className={`task-category-badge ${catClass(category)}`}>
            {category}
          </span>
        )}
        <span className={`task-priority-badge ${priClass(task.priority)}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      {/* Meta */}
      <div className="task-row-meta">
        {attachments > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Paperclip size={9} />
            {attachments}
          </span>
        )}
        {comments > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MessageSquare size={9} />
            {comments}
          </span>
        )}
        {durationMins > 0 && (
          <span className="task-row-duration">{fmtDuration(durationMins)}</span>
        )}
        {task.recurrence && task.recurrence !== "none" && (
          <RotateCcw size={10} style={{ color: "var(--muted)", opacity: 0.8 }} />
        )}
        {isHighPriority && !done && (
          <Flag size={11} className="task-flag-icon" />
        )}
        <button className="row-more" aria-label="More options" onClick={onOpen}>
          <MoreHorizontal size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Task Group ──────────────────────────────────────────────────────────────

interface TaskGroupProps {
  title: string;
  tasks: Entity[];
  color?: string;
  onToggle: (t: Entity) => void;
  onOpen: (t: Entity) => void;
  onMarkAll: () => void;
  defaultOpen?: boolean;
}

function TaskGroup({
  title,
  tasks,
  color,
  onToggle,
  onOpen,
  onMarkAll,
  defaultOpen = true,
}: TaskGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  if (tasks.length === 0) return null;
  return (
    <div className="task-group">
      <div className="task-group-header" onClick={() => setOpen((v) => !v)}>
        {color && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
        )}
        <span className="task-group-title">{title}</span>
        <span className="task-group-count">• {tasks.length} tasks</span>
        <div className="task-group-actions">
          <button
            className="task-group-mark-all"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAll();
            }}
          >
            <CheckCircle2 size={11} /> Mark all complete
          </button>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>
      {open &&
        tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onToggle={() => onToggle(t)}
            onOpen={() => onOpen(t)}
          />
        ))}
    </div>
  );
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function TaskCalendar({ tasks }: { tasks: Entity[] }) {
  const [calMonth, setCalMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with blank cells
  const startDow = getDay(monthStart); // 0=Sun
  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  // Convert to Mon-start: Mon=0 ... Sun=6
  const padStart = startDow === 0 ? 6 : startDow - 1;

  // Which days have tasks?
  const taskDays = new Set(
    tasks
      .filter((t) => t.dueAt)
      .map((t) => format(new Date(t.dueAt!), "yyyy-MM-dd")),
  );

  return (
    <div className="task-calendar-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <strong style={{ fontSize: 11 }}>Task Calendar</strong>
      </div>
      <div className="task-calendar-header">
        <span className="task-cal-month">
          {format(calMonth, "MMMM yyyy")}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="icon-button"
            style={{ width: 22, height: 22, padding: 0 }}
            onClick={() => setCalMonth((d) => subMonths(d, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            className="icon-button"
            style={{ width: 22, height: 22, padding: 0 }}
            onClick={() => setCalMonth((d) => addMonths(d, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="task-cal-grid">
        {weekdays.map((d) => (
          <div key={d} className="task-cal-weekday">
            {d}
          </div>
        ))}
        {Array.from({ length: padStart }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isTd = isSameDay(day, today);
          const isSel = isSameDay(day, selected);
          const hasTasks = taskDays.has(key);
          return (
            <button
              key={key}
              className={`task-cal-day${isTd ? " today" : ""}${isSel && !isTd ? " selected" : ""}`}
              onClick={() => setSelected(day)}
            >
              {format(day, "d")}
              {hasTasks && <span className="task-cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today's Schedule ─────────────────────────────────────────────────────────

function TodaySchedule({ tasks }: { tasks: Entity[] }) {
  const sorted = [...tasks]
    .filter((t) => t.dueAt)
    .sort(
      (a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime(),
    );

  const colors = [
    "#f97316",
    "#22c55e",
    "#ef4444",
    "#22c55e",
    "#84cc16",
    "#3b82f6",
  ];

  return (
    <div className="task-schedule-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <strong style={{ fontSize: 11 }}>Today&#39;s Schedule</strong>
        <button className="text-button" style={{ fontSize: 9, cursor: "pointer" }}>
          View all
        </button>
      </div>
      <div className="task-schedule-list">
        {sorted.length === 0 && (
          <p className="muted" style={{ fontSize: 10 }}>
            No tasks scheduled for today.
          </p>
        )}
        {sorted.slice(0, 6).map((t, i) => {
          const dur = numeric(t.data, "estimatedMinutes");
          return (
            <div key={t.id} className="task-schedule-row">
              <span className="task-schedule-time">{fmtTime(t.dueAt!)}</span>
              <span
                className="task-schedule-dot"
                style={{ background: colors[i % colors.length] }}
              />
              <span className="task-schedule-title">{t.title}</span>
              {dur > 0 && (
                <span className="task-schedule-dur">{fmtDuration(dur)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Focus Timer ─────────────────────────────────────────────────────────────

const TIMER_DURATIONS = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

function FocusTimer() {
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.pomodoro);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(3);
  const [focusSeconds, setFocusSeconds] = useState(2 * 3600 + 15 * 60); // 2h15m
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = TIMER_DURATIONS[mode];

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setRunning(false);
            if (mode === "pomodoro") {
              setSessions((s) => s + 1);
              setFocusSeconds((s) => s + TIMER_DURATIONS.pomodoro);
            }
            return 0;
          }
          if (mode === "pomodoro") setFocusSeconds((s) => s + 1);
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  function switchMode(m: "pomodoro" | "short" | "long") {
    setMode(m);
    setRunning(false);
    setTimeLeft(TIMER_DURATIONS[m]);
  }

  function reset() {
    setRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  }

  const mins = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  // Circle
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - ((total - timeLeft) / total) * circ;
  const focusHours = Math.floor(focusSeconds / 3600);
  const focusMins = Math.floor((focusSeconds % 3600) / 60);
  const focusLabel =
    focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;
  const productivity = Math.min(
    100,
    Math.round((focusSeconds / (sessions * TIMER_DURATIONS.pomodoro + 1)) * 100),
  );

  return (
    <div className="focus-timer-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: "#ecfccb", color: "#166534", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Timer size={13} />
          </span>
          <strong style={{ fontSize: 11 }}>Focus Timer</strong>
        </div>
        <button className="icon-button" style={{ width: 20, height: 20, padding: 0 }} aria-label="Timer options">
          <MoreHorizontal size={13} />
        </button>
      </div>
      <div className="focus-timer-tabs">
        {(
          [
            { key: "pomodoro", label: "Pomodoro" },
            { key: "short", label: "Short Break" },
            { key: "long", label: "Long Break" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            className={`focus-timer-tab${mode === key ? " active" : ""}`}
            onClick={() => switchMode(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="focus-timer-ring">
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle
            cx={55}
            cy={55}
            r={r}
            fill="none"
            stroke="var(--elevated)"
            strokeWidth={8}
          />
          <circle
            cx={55}
            cy={55}
            r={r}
            fill="none"
            stroke={mode === "pomodoro" ? "#a3e635" : mode === "short" ? "#38bdf8" : "#c084fc"}
            strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="focus-timer-time">
          {mins}:{secs}
        </div>
      </div>

      <p className="focus-timer-label">
        Focus Time
      </p>

      <div style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>
        Today
      </div>

      <div className="focus-timer-stats">
        <div className="focus-timer-stat">
          <strong>{sessions}</strong>
          <small>Sessions</small>
        </div>
        <div className="focus-timer-stat">
          <strong>{focusLabel}</strong>
          <small>Focus time</small>
        </div>
        <div className="focus-timer-stat">
          <strong>{productivity}%</strong>
          <small>Productivity</small>
        </div>
      </div>

      <div className="focus-timer-controls">
        <button
          className="focus-timer-btn"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          className="focus-timer-icon-btn"
          onClick={reset}
          aria-label="Reset timer"
        >
          <RotateCcw size={14} />
        </button>
        <button
          className="focus-timer-icon-btn"
          aria-label="Timer settings"
        >
          <Settings2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── View Tabs ────────────────────────────────────────────────────────────────

const VIEW_TABS = [
  { key: "list", label: "List", Icon: List },
  { key: "board", label: "Board", Icon: LayoutGrid },
  { key: "calendar", label: "Calendar", Icon: CalendarDays },
  { key: "timeline", label: "Timeline", Icon: GitBranch },
  { key: "focus", label: "Focus", Icon: Focus },
];

const SAMPLE_TASKS: Entity[] = [
  {
    id: "sample-1",
    ownerId: "sample",
    kind: "task",
    title: "Design dashboard UI",
    description: "",
    status: "todo",
    priority: "high",
    dueAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    recurrence: "none",
    tags: ["Work"],
    data: { attachments: 2, estimatedMinutes: 120, endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-2",
    ownerId: "sample",
    kind: "task",
    title: "Gym workout",
    description: "",
    status: "todo",
    priority: "medium",
    dueAt: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    recurrence: "daily",
    tags: ["Health"],
    data: { estimatedMinutes: 60, endTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-3",
    ownerId: "sample",
    kind: "task",
    title: "Finish project documentation",
    description: "",
    status: "todo",
    priority: "high",
    dueAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    recurrence: "none",
    tags: ["Work"],
    data: { attachments: 4, comments: 3, estimatedMinutes: 180, endTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-4",
    ownerId: "sample",
    kind: "task",
    title: "Buy groceries",
    description: "",
    status: "todo",
    priority: "low",
    dueAt: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
    recurrence: "none",
    tags: ["Personal"],
    data: { estimatedMinutes: 30, endTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-5",
    ownerId: "sample",
    kind: "task",
    title: "Call mom",
    description: "",
    status: "todo",
    priority: "medium",
    dueAt: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    recurrence: "weekly",
    tags: ["Personal"],
    data: { estimatedMinutes: 15, endTime: new Date(new Date().setHours(18, 15, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-6",
    ownerId: "sample",
    kind: "task",
    title: "Review finance reports",
    description: "",
    status: "todo",
    priority: "medium",
    dueAt: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
    recurrence: "none",
    tags: ["Finance"],
    data: { attachments: 1, estimatedMinutes: 60, endTime: new Date(new Date().setHours(19, 30, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-7",
    ownerId: "sample",
    kind: "task",
    title: "Read design articles",
    description: "",
    status: "todo",
    priority: "low",
    dueAt: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(),
    recurrence: "none",
    tags: ["Study"],
    data: { estimatedMinutes: 45, endTime: new Date(new Date().setHours(20, 15, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sample-8",
    ownerId: "sample",
    kind: "task",
    title: "Plan tomorrow",
    description: "",
    status: "todo",
    priority: "low",
    dueAt: new Date(new Date().setHours(20, 15, 0, 0)).toISOString(),
    recurrence: "daily",
    tags: ["Personal"],
    data: { estimatedMinutes: 30, endTime: new Date(new Date().setHours(20, 45, 0, 0)).toISOString() },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `upcoming-${i + 1}`,
    ownerId: "sample",
    kind: "task" as const,
    title: [
      "Quarterly roadmap review",
      "Prepare sprint retrospective",
      "Doctor follow-up appointment",
      "Update cloud infrastructure",
      "Schedule team 1-on-1s",
      "Draft pitch deck slides",
      "Renew car insurance",
      "Review pull requests",
      "Book flight tickets",
      "Grocery pantry restocking",
      "Finish online course chapter",
      "Organize desk workspace",
    ][i]!,
    description: "",
    status: "todo" as const,
    priority: (["high", "medium", "low", "urgent"][i % 4] as "high" | "medium" | "low" | "urgent"),
    dueAt: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    recurrence: "none" as const,
    tags: [["Work", "Personal", "Health", "Study", "Finance", "Home"][i % 6]!],
    data: { estimatedMinutes: 45 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `overdue-${i + 1}`,
    ownerId: "sample",
    kind: "task" as const,
    title: [
      "Submit invoice for September",
      "Review health insurance claims",
      "Pay broadband electricity utility",
      "Send contract feedback",
    ][i]!,
    description: "",
    status: "todo" as const,
    priority: (i === 0 ? "urgent" : "high") as "urgent" | "high",
    dueAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    recurrence: "none" as const,
    tags: [["Finance", "Health", "Home", "Work"][i]!],
    data: { estimatedMinutes: 30 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function TaskPage({
  entities,
  moduleItems,
  profile,
  open,
  add,
  navigate: _navigate,
  toggle,
  update: _update,
}: TaskPageProps) {
  const dbTasks = (moduleItems.length > 0 ? moduleItems : entities).filter(
    (e) => e.kind === "task",
  );
  const [localTasks, setLocalTasks] = useState<Entity[]>(() => SAMPLE_TASKS);
  const allTasks = dbTasks.length > 0 ? dbTasks : localTasks;

  const handleToggle = (t: Entity) => {
    if (dbTasks.length > 0) {
      toggle(t);
    } else {
      setLocalTasks((prev) =>
        prev.map((item) =>
          item.id === t.id
            ? { ...item, status: item.status === "completed" ? "todo" : "completed" }
            : item,
        ),
      );
    }
  };

  // Filters state
  const [sidebarFilter, setSidebarFilter] = useState<FilterKey>("all");
  const [viewMode, setViewMode] = useState("list");
  const [pillFilter, setPillFilter] = useState<FilterKey>("all");

  // Stats
  const todayTasks = allTasks.filter(isTodayTask);
  const upcomingTasks = allTasks.filter(isUpcoming);
  const overdueTasks = allTasks.filter((t) => isOverdue(t));
  const completedTasks = allTasks.filter((t) => t.status === "completed");
  const inboxTasks = allTasks.filter(isInbox);

  const todayCompleted = todayTasks.filter((t) => t.status === "completed");
  const todayPct =
    todayTasks.length > 0
      ? Math.round((todayCompleted.length / todayTasks.length) * 100)
      : 0;

  // Total completed duration this week
  const weeklyFocusMins = completedTasks
    .filter((t) => isThisWeek(new Date(t.updatedAt)))
    .reduce((sum, t) => sum + (numeric(t.data, "estimatedMinutes") || 0), 0);
  const weeklyHours = Math.floor(weeklyFocusMins / 60);
  const weeklyMins = weeklyFocusMins % 60;
  const weeklyLabel =
    weeklyHours > 0
      ? `${weeklyHours}h ${weeklyMins}m`
      : `${weeklyMins}m`;

  // Sparkline helpers - last 7 days task counts
  const today7 = new Date();
  const sparkBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today7);
    d.setDate(d.getDate() - (6 - i));
    return allTasks.filter(
      (t) => t.dueAt && isSameDay(new Date(t.dueAt), d),
    ).length;
  });

  // Filter tasks for main display
  function filterTasks(tasks: Entity[]): Entity[] {
    const activeFilter = pillFilter !== "all" ? pillFilter : sidebarFilter;
    switch (activeFilter) {
      case "today":
        return tasks.filter(isTodayTask);
      case "upcoming":
        return tasks.filter(isUpcoming);
      case "overdue":
        return tasks.filter((t) => isOverdue(t));
      case "completed":
        return tasks.filter((t) => t.status === "completed");
      case "inbox":
        return tasks.filter(isInbox);
      case "urgent":
      case "high":
      case "medium":
      case "low":
        return tasks.filter((t) => t.priority === activeFilter);
      default:
        if (["Work", "Personal", "Health", "Study", "Finance", "Home"].includes(activeFilter)) {
          return tasks.filter((t) => t.tags.includes(activeFilter));
        }
        return tasks;
    }
  }

  const visibleTasks = filterTasks(allTasks);

  // Group visible tasks
  const visibleToday = visibleTasks.filter(isTodayTask);
  const visibleUpcoming = visibleTasks.filter(isUpcoming);
  const visibleOverdue = visibleTasks.filter((t) => isOverdue(t));

  // If a specific filter is active, show ungrouped
  const activeFilter = pillFilter !== "all" ? pillFilter : sidebarFilter;
  const showGrouped = activeFilter === "all";

  return (
    <div className="task-page">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="task-page-header">
        <div>
          <h1 className="task-page-title">Tasks</h1>
          <p className="task-page-subtitle">Turn your plans into progress.</p>
        </div>
        <button className="task-primary-add-btn" onClick={() => add("task")}>
          <Plus size={16} />
          <span>Add task</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="task-stat-grid">
        <StatCard
          icon={<SquareCheck size={16} color="#15803d" />}
          iconBg="#dcfce7"
          title="Today"
          value={String(todayTasks.length)}
          sub={`${todayCompleted.length} completed`}
          blobColor="#86efac"
          ringPct={todayPct}
          ringColor="#22c55e"
        />
        <StatCard
          icon={<CalendarDays size={16} color="#c2410c" />}
          iconBg="#ffedd5"
          title="Upcoming"
          value={String(upcomingTasks.length)}
          sub="Next 7 days"
          blobColor="#fed7aa"
          sparkBars={sparkBars}
          sparkColor="#f97316"
        />
        <StatCard
          icon={<Flame size={16} color="#dc2626" />}
          iconBg="#fee2e2"
          title="Overdue"
          value={String(overdueTasks.length)}
          sub="Needs attention"
          blobColor="#fca5a5"
          sparkBars={[...sparkBars].reverse()}
          sparkColor="#ef4444"
        />
        <StatCard
          icon={<TrendingUp size={16} color="#166534" />}
          iconBg="#dcfce7"
          title="Completed"
          value={weeklyLabel || "0m"}
          sub="This week"
          blobColor="#86efac"
          sparkBars={sparkBars.map((v, i) => Math.max(0, v - i))}
          sparkColor="#22c55e"
        />
      </div>

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="task-main">
        {/* Sidebar */}
        <TaskSidebar
          tasks={allTasks}
          active={sidebarFilter}
          onSelect={(k) => {
            setSidebarFilter(k);
            setPillFilter("all");
          }}
          todayCount={todayTasks.length}
          upcomingCount={upcomingTasks.length}
          overdueCount={overdueTasks.length}
          completedCount={completedTasks.length}
          inboxCount={inboxTasks.length}
        />

        {/* Content */}
        <div className="task-content">
          {/* View Tabs */}
          <div className="task-view-tabs">
            {VIEW_TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`task-view-tab${viewMode === key ? " active" : ""}`}
                onClick={() => setViewMode(key)}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
            <div className="task-view-tab-divider" />
            <button className="task-view-tab">
              <SlidersHorizontal size={12} />
              Sort
            </button>
            <button className="task-view-tab">
              <MoreHorizontal size={12} />
            </button>
            <button
              className="task-view-tab"
              onClick={() => add("task")}
              style={{ color: "#22c55e" }}
            >
              <Plus size={12} />
              Add task
            </button>
          </div>

          {/* Filter pills */}
          <div className="task-filter-pills">
            {[
              { key: "all", label: "All", count: allTasks.length },
              { key: "today", label: "Today", count: todayTasks.length, dot: "#22c55e" },
              { key: "upcoming", label: "Upcoming", count: upcomingTasks.length, dot: "#f97316" },
              { key: "overdue", label: "Overdue", count: overdueTasks.length, dot: "#ef4444" },
              { key: "completed", label: "Completed", count: completedTasks.length, dot: "#9ca3af" },
            ].map(({ key, label, count, dot }) => (
              <button
                key={key}
                className={`task-filter-pill${pillFilter === key ? " active" : ""}`}
                onClick={() => {
                  setPillFilter(key as FilterKey);
                  setSidebarFilter("all");
                }}
              >
                {dot && (
                  <span
                    className="pill-dot"
                    style={{ background: dot }}
                  />
                )}
                {label}
                <span
                  style={{
                    background: pillFilter === key ? "rgba(255,255,255,0.2)" : "var(--border)",
                    borderRadius: 10,
                    padding: "1px 5px",
                    fontSize: 9,
                    marginLeft: 2,
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Task Groups */}
          {showGrouped ? (
            <>
              <TaskGroup
                title="Today"
                tasks={visibleToday}
                color="#22c55e"
                onToggle={handleToggle}
                onOpen={open}
                onMarkAll={() =>
                  visibleToday
                    .filter((t) => t.status !== "completed")
                    .forEach(handleToggle)
                }
                defaultOpen
              />
              <TaskGroup
                title="Upcoming"
                tasks={visibleUpcoming}
                color="#f97316"
                onToggle={handleToggle}
                onOpen={open}
                onMarkAll={() =>
                  visibleUpcoming
                    .filter((t) => t.status !== "completed")
                    .forEach(handleToggle)
                }
                defaultOpen={false}
              />
              {overdueTasks.length > 0 && (
                <TaskGroup
                  title="Overdue"
                  tasks={visibleOverdue}
                  color="#ef4444"
                  onToggle={handleToggle}
                  onOpen={open}
                  onMarkAll={() =>
                    visibleOverdue
                      .filter((t) => t.status !== "completed")
                      .forEach(handleToggle)
                  }
                  defaultOpen
                />
              )}
            </>
          ) : (
            <div className="task-group">
              <div className="task-group-header">
                <span className="task-group-title" style={{ textTransform: "capitalize" }}>
                  {activeFilter}
                </span>
                <span className="task-group-count">• {visibleTasks.length} tasks</span>
                <div className="task-group-actions">
                  <button
                    className="task-group-mark-all"
                    onClick={() =>
                      visibleTasks
                        .filter((t) => t.status !== "completed")
                        .forEach(handleToggle)
                    }
                  >
                    <CheckCircle2 size={11} /> Mark all complete
                  </button>
                </div>
              </div>
              {visibleTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => handleToggle(t)}
                  onOpen={() => open(t)}
                />
              ))}
              {visibleTasks.length === 0 && (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <p className="muted" style={{ fontSize: 11 }}>No tasks here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <aside className="task-right-panel">
          <TaskCalendar tasks={allTasks} />
          <TodaySchedule tasks={todayTasks} />
          <FocusTimer />
        </aside>
      </div>
    </div>
  );
}
