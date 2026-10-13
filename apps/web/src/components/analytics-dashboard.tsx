"use client";
import { useState } from "react";
import {
  Clock3,
  FilePlus2,
  ArrowUpRight,
  Plus,
  Zap,
  ArrowRight,
  FileText,
  SquarePen,
  Users,
  MoreVertical,
  MoreHorizontal,
  Check,
  Folder,
  MessageSquare,
  LoaderCircle,
  ChartNoAxesCombined,
  MoveUpRight,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { format } from "date-fns";
import { numeric, stringValue } from "@crunchrr/utils";
import { type DashboardProps } from "./dashboard";
import { Dialog } from "./ui/dialog";
export function AnalyticsDashboard({
  entities,
  profile,
  summary,
  open,
  add,
  navigate,
  demo = false,
  saveWidgets,
}: DashboardProps & {
  demo?: boolean;
  saveWidgets: (widgets: string[]) => void;
}) {
  const [unit, setUnit] = useState<"hours" | "minutes">("hours");
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const analytics = summary?.analytics;
  const days =
    analytics?.daily ||
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => ({
      label,
      date: "",
      minutes: 0,
    }));
  const notes = entities
    .filter((e) => e.kind === "note")
    .sort(
      (a, b) =>
        Number(b.tags.includes("reference-demo")) -
        Number(a.tags.includes("reference-demo")),
    )
    .slice(0, 3);
  const people = entities
    .filter(
      (e) =>
        e.kind === "person" &&
        (e.data.relationship === "Teammate" || numeric(e.data, "progress") > 0),
    )
    .sort(
      (a, b) =>
        numeric(a.data, "displayOrder") - numeric(b.data, "displayOrder"),
    )
    .slice(0, 3);
  const now = new Date();
  return (
    <div className="reference-dashboard">
      <div className="reference-greeting">
        <h1>
          Hi {profile.name}
          <span aria-hidden="true" className="greeting-hand">
            👋🏻
          </span>
        </h1>
        <p>Glad to see you again!</p>
      </div>
      <div className="reference-grid">
        <section className="reference-stat stat-hours">
          <span className="stat-token lime-token">
            <Clock3 size={18} strokeWidth={3} />
          </span>
          <Contours tone="lime" />
          <div className="stat-copy">
            <h2>
              {analytics?.hoursLastWeek?.toLocaleString("en", {
                maximumFractionDigits: 1,
              }) || 0}{" "}
              hours
            </h2>
            <p>at work last week</p>
          </div>
          <button
            className="stat-full-link"
            aria-label="View tracked work time"
            onClick={() => navigate("tasks")}
          />
        </section>
        <section className="reference-stat stat-tasks">
          <span className="stat-token yellow-token">
            <FilePlus2 size={19} strokeWidth={2.5} />
          </span>
          <Contours tone="yellow" />
          <div className="stat-copy">
            <h2>{analytics?.completedLastWeek || 0} tasks</h2>
            <p>completed last week</p>
          </div>
          <button
            className="stat-full-link"
            aria-label="View completed tasks"
            onClick={() => navigate("tasks")}
          />
        </section>
        <section className="widget-placeholder">
          <span className="widget-tip">
            You can create a new
            <br />
            widget right here.
          </span>
          <span className="widget-bolt">
            <Zap size={14} fill="currentColor" />
          </span>
          <p>Add new widgets</p>
          <button
            className="widget-add"
            aria-label="Add dashboard widget"
            onClick={() => setWidgetsOpen(true)}
          >
            <Plus size={24} />
          </button>
        </section>
        <section className="premium-card">
          <button
            className="premium-arrow"
            aria-label="View workspace settings"
            onClick={() => navigate("settings")}
          >
            <ArrowUpRight size={23} />
          </button>
          <div className="premium-shape">
            <svg
              className="premium-contours"
              viewBox="0 0 400 260"
              aria-hidden="true"
            >
              <path
                d="M-40 160C40 70 100 250 210 130S360-30 460 100M-40 180C70 70 120 280 230 145S350 10 460 130M-40 205C80 95 160 300 250 180S390 40 460 150"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            <h2>{demo ? "Go premium" : "Connect your life"}</h2>
            <p>
              {demo ? (
                <>
                  <strong>$93.7</strong> <span>per month</span>
                </>
              ) : (
                <>
                  <strong>One place.</strong>
                  <span>All of you.</span>
                </>
              )}
            </p>
            <div className="premium-tags">
              <button onClick={() => add("note")}>new</button>
              <button onClick={() => navigate("projects")}>
                opportunities
              </button>
            </div>
          </div>
        </section>
        <section className="reference-card work-chart">
          <div className="work-days">
            {days.map((day) => (
              <span key={day.label}>{day.label}</span>
            ))}
          </div>
          <div className="work-plot">
            <div className="work-wave">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={days.map((d) => ({ ...d, value: d.minutes / 60 }))}
                  margin={{ top: 10, right: 14, bottom: 25, left: 14 }}
                >
                  <YAxis hide domain={[0, 12]} />
                  <defs>
                    <linearGradient
                      id="work-line-gradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#ffe32e" />
                      <stop offset="48%" stopColor="#ffd524" />
                      <stop offset="65%" stopColor="#cbfc46" />
                      <stop offset="100%" stopColor="#cbfc46" />
                    </linearGradient>
                  </defs>
                  <Line
                    type="natural"
                    dataKey="value"
                    stroke="url(#work-line-gradient)"
                    strokeWidth={5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="work-bars">
              {days.map((day) => {
                const hours = day.minutes / 60;
                const count = Math.max(0, Math.min(6, Math.ceil(hours * 0.75)));
                return (
                  <button
                    className="work-day"
                    key={day.label}
                    onClick={() => navigate("tasks")}
                    aria-label={`${day.label}: ${day.minutes} tracked minutes`}
                  >
                    <span className="work-bar-label">
                      {unit === "hours"
                        ? `${hours.toLocaleString("en", { maximumFractionDigits: 1 })}h`
                        : `${day.minutes}m`}
                    </span>
                    <span className="work-segments">
                      {Array.from({ length: count }, (_, i) => (
                        <i
                          className={
                            i < Math.ceil(count * 0.4)
                              ? "segment-lime"
                              : "segment-yellow"
                          }
                          key={i}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="time-controls">
              <div>
                <p>
                  Track time
                  <br />
                  spent at work
                </p>
                <button
                  aria-label="Add tracked work session"
                  onClick={() => add("task")}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="time-unit">
                <button
                  className={unit === "hours" ? "selected" : ""}
                  onClick={() => setUnit("hours")}
                >
                  hours
                </button>
                <button
                  className={unit === "minutes" ? "selected" : ""}
                  onClick={() => setUnit("minutes")}
                >
                  minutes
                </button>
              </div>
            </div>
          </div>
          {!days.some((d) => d.minutes > 0) && (
            <div className="work-empty">
              <p>A fresh week. A little room to grow.</p>
              <button onClick={() => add("task")}>
                Track your first session <Plus size={15} />
              </button>
            </div>
          )}
        </section>
        <section className="reference-card completion-card">
          <div className="reference-card-header">
            <span className="black-widget-icon">
              <ChartNoAxesCombined size={22} />
            </span>
            <h2>
              Completed
              <br />
              task statistics
            </h2>
            <button
              className="round-arrow lime-arrow"
              aria-label="Open task statistics"
              onClick={() => navigate("tasks")}
            >
              <ArrowUpRight size={21} />
            </button>
          </div>
          <div className="completion-months">
            {(analytics?.monthly || []).map((month, i) => (
              <button
                className={`completion-month ${i === 1 ? "highlighted" : ""}`}
                key={month.label}
                onClick={() => navigate("tasks")}
              >
                <span>{month.label}</span>
                <i>
                  <b style={{ width: `${month.percentage}%` }} />
                </i>
                <strong>{month.percentage}%</strong>
              </button>
            ))}
          </div>
          <button className="progress-link" onClick={() => navigate("goals")}>
            View more progress
            <span>
              <ArrowRight size={21} />
            </span>
          </button>
        </section>
        <section className="reference-card last-notes">
          <div className="notes-heading">
            <span className="notes-heading-icon">
              <FileText size={18} />
            </span>
            <h2>Last notes</h2>
            <button aria-label="Create note" onClick={() => add("note")}>
              <SquarePen size={20} />
            </button>
            <button
              className="notes-team"
              aria-label="Open people"
              onClick={() => navigate("people")}
            >
              <Users size={22} fill="currentColor" />
            </button>
          </div>
          <div className="notes-table">
            <div className="notes-table-head">
              <span>Type</span>
              <span>Date</span>
              <span>Status</span>
              <span>Duration</span>
              <span />
            </div>
            {notes.map((note, i) => {
              const progress = numeric(note.data, "progress");
              return (
                <div className="reference-note-row" key={note.id}>
                  <button
                    className="reference-note-title"
                    onClick={() => open(note)}
                  >
                    <span className={`note-type-icon note-type-${i}`}>
                      <NoteTypeIcon index={i} />
                    </span>
                    <span>
                      <strong>{note.title}</strong>
                      <small>
                        {note.description ||
                          stringValue(note.data, "content")
                            .replace(/^#+\s*/, "")
                            .slice(0, 45)}
                      </small>
                    </span>
                  </button>
                  <time>
                    {format(
                      new Date(note.dueAt || note.updatedAt),
                      "dd.MM.yyyy",
                    )}
                  </time>
                  <button
                    className={`note-status ${note.status === "completed" ? "is-completed" : progress ? "has-progress" : "is-progress"}`}
                    onClick={() => open(note)}
                  >
                    {note.status === "completed" ? (
                      <Check size={15} />
                    ) : progress ? (
                      <LoaderCircle size={15} />
                    ) : (
                      <span className="note-pending-ring" />
                    )}
                    {note.status === "completed"
                      ? "Completed"
                      : progress
                        ? `${progress}%`
                        : "In Progress"}
                  </button>
                  <span className="note-duration">
                    {numeric(note.data, "durationMinutes") / 60} hours
                  </span>
                  <button
                    aria-label={`Open ${note.title} note`}
                    className="note-more"
                    onClick={() => open(note)}
                  >
                    <MoreHorizontal size={19} />
                  </button>
                </div>
              );
            })}
            {!notes.length && (
              <div className="reference-notes-empty">
                <FileText size={24} />
                <p>Ideas deserve a place to land.</p>
                <button onClick={() => add("note")}>
                  Create your first note <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
        <section className="reference-card teamwork-card">
          <div className="reference-card-header">
            <span className="team-widget-icon">
              <Users size={27} fill="currentColor" />
            </span>
            <h2>
              Teamwork
              <br />
              overview
            </h2>
            <button
              className="round-arrow yellow-arrow"
              aria-label="Open teamwork overview"
              onClick={() => navigate("people")}
            >
              <ArrowUpRight size={21} />
            </button>
          </div>
          <div className="team-columns">
            {people.map((person, i) => {
              const progress = numeric(person.data, "progress");
              return (
                <button
                  key={person.id}
                  onClick={() => open(person)}
                  style={{ height: `${56 + progress * 0.8}px` }}
                  className={`team-column team-column-${i}`}
                >
                  <span className="team-percent">{progress}%</span>
                  <span
                    className="team-progress-fill"
                    style={{ height: `${Math.max(38, progress)}%` }}
                  />
                  {person.data.avatarUrl ? (
                    <img
                      alt=""
                      src={
                        demo &&
                        person.tags.includes("reference-demo") &&
                        ["Alicia", "Mark", "James"].includes(person.title)
                          ? `/demo/${person.title.toLowerCase()}.jpg`
                          : stringValue(person.data, "avatarUrl")
                      }
                    />
                  ) : (
                    <span className="team-initial">
                      {person.title.slice(0, 1)}
                    </span>
                  )}
                  <strong>{person.title}</strong>
                </button>
              );
            })}
            {!people.length && (
              <div className="team-empty">
                <p>A little better, together.</p>
                <button onClick={() => add("person")}>
                  Add a person <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="extra-widgets">
        {[
          { key: "tasks", kind: "task", label: "Tasks & focus" },
          { key: "notes", kind: "note", label: "Notes & ideas" },
          { key: "goals", kind: "goal", label: "Goals & progress" },
          { key: "people", kind: "person", label: "People & projects" },
        ]
          .filter((w) => profile.widgets.includes(`show:${w.key}`))
          .map((w) => (
            <section key={w.key} className="reference-card extra-widget">
              <div className="reference-card-header">
                <h2>{w.label}</h2>
                <button
                  aria-label={`Remove ${w.label} widget`}
                  className="round-arrow lime-arrow"
                  onClick={() =>
                    saveWidgets(
                      profile.widgets.filter((v) => v !== `show:${w.key}`),
                    )
                  }
                >
                  <Plus size={18} style={{ transform: "rotate(45deg)" }} />
                </button>
              </div>
              {entities
                .filter((e) => e.kind === w.kind)
                .slice(0, 3)
                .map((e) => (
                  <button
                    key={e.id}
                    className="extra-widget-row"
                    onClick={() => open(e)}
                  >
                    {e.title}
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              <button
                className="extra-widget-add"
                onClick={() => navigate(w.key)}
              >
                Explore {w.key}
                <ArrowRight size={15} />
              </button>
            </section>
          ))}
      </div>
      <p className="reference-footer">
        Your little things. One connected life.
      </p>
      <Dialog
        open={widgetsOpen}
        onOpenChange={setWidgetsOpen}
        title="Add a little more context"
        description="Add a connected widget. Your choice is saved to your workspace."
      >
        <div className="widget-options">
          {[
            { label: "Tasks & focus", route: "tasks", icon: Clock3 },
            { label: "Notes & ideas", route: "notes", icon: FileText },
            {
              label: "Goals & progress",
              route: "goals",
              icon: ChartNoAxesCombined,
            },
            { label: "People & projects", route: "people", icon: Users },
          ].map((w) => (
            <button
              key={w.route}
              onClick={() => {
                saveWidgets([
                  ...profile.widgets.filter((v) => v !== `show:${w.route}`),
                  `show:${w.route}`,
                ]);
                setWidgetsOpen(false);
              }}
            >
              <w.icon size={20} />
              {w.label}
              <ArrowUpRight size={17} />
            </button>
          ))}
          <button
            onClick={() => {
              setWidgetsOpen(false);
              navigate("settings");
            }}
          >
            <Plus size={20} />
            Customize dashboard
            <ArrowRight size={17} />
          </button>
        </div>
      </Dialog>
    </div>
  );
}
function NoteTypeIcon({ index }: { index: number }) {
  return index === 0 ? (
    <SquarePen size={14} fill="currentColor" />
  ) : index === 1 ? (
    <Folder size={15} />
  ) : (
    <MessageSquare size={15} fill="currentColor" />
  );
}
function Contours({ tone }: { tone: "lime" | "yellow" }) {
  const colors =
    tone === "lime"
      ? ["#d0ff4e", "#e2ff8d", "#efffbd"]
      : ["#ffbf00", "#ffdc68", "#fff2c6"];
  return (
    <svg className="stat-contours" viewBox="0 0 150 150" aria-hidden="true">
      <path
        d="M54-30C-9 9-10 33 15 49S58 58 53 94S95 148 157 100L180-15Z"
        fill={colors[0]}
      />
      <path
        d="M72-25C15 4 13 30 36 43S80 51 71 82S110 130 165 87L181-20Z"
        fill={colors[1]}
      />
      <path
        d="M91-20C40 4 37 28 60 37S97 42 90 67S125 107 166 73L180-20Z"
        fill={colors[2]}
      />
    </svg>
  );
}
export function ReferenceClock({
  profile,
  demo,
}: {
  profile: import("@crunchrr/validation").Profile;
  demo: boolean;
}) {
  const now = new Date();
  return (
    <div className="reference-header-clock">
      <strong>
        {new Intl.DateTimeFormat("en", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: profile.timezone,
        }).format(now)}
      </strong>
      <div>
        <small>
          {new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "short",
            weekday: "long",
            timeZone: profile.timezone,
          }).format(now)}
        </small>
        {demo ? (
          <span className="reference-weather">
            <span>
              Cloudy
              <br />
              <b>21°C</b>
            </span>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8a5 5 0 0 1 0 10Z" />
            </svg>
          </span>
        ) : (
          <span className="timezone-label">
            {profile.timezone.replaceAll("_", " ")}
          </span>
        )}
      </div>
    </div>
  );
}
