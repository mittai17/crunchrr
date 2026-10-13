"use client";
import { AnalyticsDashboard, ReferenceClock } from "./analytics-dashboard";
import { Logo } from "./logo";
import { useEffect, useMemo, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Command,
  Link2,
  Trash2,
  Pencil,
  Check,
  Download,
  Menu,
  X,
  Settings,
  CalendarDays,
  SquareCheck,
  LayoutDashboard,
  SlidersHorizontal,
  Send,
  Shield,
  RefreshCw,
  FolderOpen,
  GripVertical,
  House,
  UserRound,
  LogOut,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import {
  createApiClient,
  type ApiClient,
  type AiResponse,
} from "@crunchrr/api-client";
import {
  createEntitySchema,
  entityKinds,
  type Entity,
  type EntityKind,
  type CreateEntity,
  type Profile,
} from "@crunchrr/validation";
import { numeric, money, dayKey, stringValue } from "@crunchrr/utils";
import { useShellStore } from "@crunchrr/state";
import { modules, railModules, relatedSections, pageDescriptions, kindIcons, kindLabel, routeFor } from "@/lib/modules";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { EntityForm } from "./entity-form";
import { CalendarWorkspace } from "./calendar-workspace";
import { TaskPage } from "./task-page";
import {
  Dashboard,
  Card,
  Empty,
  IconTile,
  MiniCalendar,
  TaskList,
  Schedule,
  FinanceCard,
  HealthCard,
  Medicines,
  HabitCard,
  type DashboardProps,
} from "./dashboard";
function Welcome() {
  return (
    <main className="welcome">
      <div className="welcome-art" />
      <div className="welcome-content">
        <Logo />
        <h1>
          A little less chaos.
          <br />A lot more life.
        </h1>
        <p>
          Tasks, plans, wellbeing and everything in between.
          <br />
          Finally connected in one place.
        </p>
        <div className="welcome-actions">
          <Button asChild>
            <Link href="/sign-up">
              Create your space <ArrowRight size={16} />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
        <Link className="text-button" href="/demo/dashboard">
          Explore with demo data <ArrowRight size={14} />
        </Link>
        <small>Private by design. Yours by default.</small>
      </div>
    </main>
  );
}
export function Workspace() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const pathname = usePathname();
  const demo = pathname.startsWith("/demo");
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  if (!isLoaded && !demo)
    return (
      <div className="loading-screen">
        <Logo />
        <div className="skeleton" />
      </div>
    );
  if (!isSignedIn && !demo) return <Welcome />;
  return (
    <QueryClientProvider client={client}>
      <App key={demo ? "demo" : userId} demo={demo} />
    </QueryClientProvider>
  );
}
function App({ demo }: { demo: boolean }) {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const route = parts[demo ? 1 : 0] || "dashboard";
  const entityId = parts[demo ? 2 : 1];
  const client = useQueryClient();
  const reduced = useReducedMotion();
  const shell = useShellStore();
  const tokenRef = useRef(getToken);
  tokenRef.current = getToken;
  const api = useMemo(
    () =>
      createApiClient(
        demo
          ? process.env.NEXT_PUBLIC_DEMO_API_URL ||
              "http://localhost:4001/api/v1"
          : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
        () => (demo ? Promise.resolve(null) : tokenRef.current()),
        demo,
      ),
    [demo],
  );
  const [modulesOpen, setModulesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false),
    [search, setSearch] = useState(""),
    [debounced, setDebounced] = useState(""),
    [mobileMenu, setMobileMenu] = useState(false),
    [notificationsOpen, setNotificationsOpen] = useState(false),
    [form, setForm] = useState<{
      kind: EntityKind;
      entity?: Entity;
      proposal?: CreateEntity;
    } | null>(null),
    [selected, setSelected] = useState<Entity | null>(null),
    [toast, setToast] = useState(""),
    [calendarDate, setCalendarDate] = useState(new Date()),
    [calendarView, setCalendarView] = useState("Week"),
    [moduleQuery, setModuleQuery] = useState(""),
    [financeKind, setFinanceKind] = useState<EntityKind>("expense"),
    [page, setPage] = useState(1);
  const key = demo ? "demo" : userId || "signed-out";
  const records = useQuery({
    queryKey: ["records", key],
    queryFn: () => api.list(),
  });
  const profileQuery = useQuery({
    queryKey: ["profile", key],
    queryFn: api.profile,
  });
  const notifications = useQuery({
    queryKey: ["notifications", key],
    queryFn: api.notifications,
    refetchInterval: 60000,
  });
  const summary = useQuery({
    queryKey: ["summary", key],
    queryFn: async () => {
      const token = await (demo ? Promise.resolve(null) : getToken());
      const base = demo
        ? process.env.NEXT_PUBLIC_DEMO_API_URL || "http://localhost:4001/api/v1"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const response = await fetch(`${base}/dashboard`, {
        headers: {
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : { "X-Crunchrr-Demo": "true" }),
        },
      });
      if (!response.ok) throw new Error("Could not load dashboard totals");
      return response.json() as Promise<NonNullable<DashboardProps["summary"]>>;
    },
  });
  const searchResults = useQuery({
    queryKey: ["search", key, debounced],
    queryFn: () => api.list(undefined, debounced),
    enabled: searchOpen && debounced.length > 0,
  });
  const currentModule = modules.find((m) => m.path === route);
  const activeRailPath = railModules.some((module) => module.path === route)
    ? route
    : relatedSections[route]?.[0];
  const kind =
    currentModule && "kind" in currentModule ? currentModule.kind : undefined;
  const moduleKind = route === "finance" ? financeKind : kind;
  const moduleRecords = useQuery({
    queryKey: ["module", key, moduleKind, moduleQuery, page],
    queryFn: () => api.list(moduleKind, moduleQuery || undefined, page),
    enabled: !!moduleKind && route !== "dashboard",
  });
  const routeEntity = useQuery({
    queryKey: ["entity", key, entityId],
    queryFn: () => api.get(entityId!),
    enabled: !!entityId,
  });
  const entity = entityId ? routeEntity.data || null : selected;
  const links = useQuery({
    queryKey: ["links", key, entity?.id],
    queryFn: () => api.links(entity!.id),
    enabled: !!entity,
  });
  const [linkTarget, setLinkTarget] = useState("");
  const [linkQuery, setLinkQuery] = useState("");
  const linkCandidates = useQuery({
    queryKey: ["link-candidates", key, linkQuery],
    queryFn: () => api.list(undefined, linkQuery),
    enabled: !!entity && linkQuery.trim().length > 1,
  });
  const invalidate = async () => {
    await Promise.all(
      [
        "records",
        "module",
        "search",
        "summary",
        "entity",
        "links",
        "notifications",
      ].map((q) => client.invalidateQueries({ queryKey: [q, key] })),
    );
  };
  const saveProfile = useMutation({
    mutationFn: api.saveProfile,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["profile", key] });
      setToast("Preferences saved");
    },
    onError: (e) => setToast(e.message),
  });
  const mutation = useMutation({
    mutationFn: ({
      e,
      changes,
    }: {
      e: Entity;
      changes: Record<string, unknown>;
    }) => api.update(e, changes),
    onSuccess: async (updated) => {
      if (selected?.id === updated.id) setSelected(updated);
      await invalidate();
      setToast("Saved");
    },
    onError: (e) => setToast(e.message),
  });
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 200);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    setPage(1);
    setModuleQuery("");
  }, [route]);
  useEffect(() => {
    const theme = profileQuery.data?.theme || "system";
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && media.matches),
      );
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [profileQuery.data?.theme]);
  const navigate = (path: string) => {
    setMobileMenu(false);
    setSelected(null);
    router.push(`${demo ? "/demo" : ""}/${path}`);
  };
  const open = (e: Entity) => {
    setSelected(e);
    setSearchOpen(false);
  };
  const add = (kind: EntityKind) => {
    setSearchOpen(false);
    setForm({ kind });
  };
  async function save(value: CreateEntity, e?: Entity) {
    if (e) {
      const updated = await api.update(e, {
        title: value.title,
        description: value.description,
        dueAt: value.dueAt,
        status: value.status,
        priority: value.priority,
        recurrence: value.recurrence,
        tags: value.tags,
        data: value.data,
      });
      setSelected(updated);
    } else {
      await api.create(value);
    }
    await invalidate();
    setToast(e ? "Changes saved" : "Record created");
  }
  const defaultProfile: Profile = {
    name: "Friend",
    timezone: "Asia/Kolkata",
    currency: "INR",
    theme: "system",
    aiPermissions: [],
    widgets: [],
    onboarded: false,
    notifications: true,
  };
  const profile = profileQuery.data || defaultProfile;
  const items = records.data?.items || [];
  const moduleItems = moduleRecords.data?.items || [];
  const props: DashboardProps = {
    entities: items,
    profile,
    open,
    add,
    navigate,
    toggle: (e) =>
      mutation.mutate({
        e,
        changes: { status: e.status === "completed" ? "todo" : "completed" },
      }),
    update: (e, data) => mutation.mutate({ e, changes: { data } }),
    summary: summary.data,
  };
  const screenProps = { ...props, entities: moduleItems };
  const unread = notifications.data?.filter((n) => !n.read).length || 0;
  return (
    <div
      className={`app-shell ${route === "calendar" ? "calendar-shell" : ""} ${shell.collapsed ? "sidebar-collapsed" : ""} ${shell.focus ? "focus-mode" : ""}`}
    >
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Logo />
          <button
            className="mobile-close icon-button"
            aria-label="Close navigation"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Main navigation">
          {railModules.map((m) => (
            <Link
              href={`${demo ? "/demo" : ""}/${m.path}`}
              key={m.path}
              onClick={() => {
                setMobileMenu(false);
                setSelected(null);
              }}
              className={`nav-item ${activeRailPath === m.path ? "active" : ""}`}
              title={m.label}
              aria-label={m.label}
              aria-current={route === m.path ? "page" : undefined}
            >
              <m.icon size={18} />
              <span>{m.label}</span>
              {m.path === "assistant" && <span className="ai-label">AI</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <Sparkles size={20} />
            <strong>Organize your chaos.</strong>
            <small>One place. All of you.</small>
          </div>
          <div className="profile-row">
            <button
              className="avatar"
              aria-label="Open all modules"
              onClick={() => setModulesOpen(true)}
            >
              <UserRound size={19} />
            </button>
            <span>
              <strong>{profile.name}</strong>
              <small>{demo ? "Demo workspace" : "Personal workspace"}</small>
            </span>
          </div>
          <Link
            className={`nav-item ${route === "settings" ? "active" : ""}`}
            href={`${demo ? "/demo" : ""}/settings`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button
            className="rail-exit"
            aria-label="Go to private workspace"
            onClick={() => router.push("/dashboard")}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <button className="home-pill" onClick={() => navigate("dashboard")}>
            <House size={18} fill="currentColor" />
            <span>
              {route === "dashboard" ? "Home" : currentModule?.label || "Home"}
            </span>
          </button>
          <button
            className="global-search"
            aria-label="Search anything"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={18} />
            <span>Search</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="header-actions">
            <Button onClick={() => add("task")}>
              <Plus size={17} />
              <span>Add tasks</span>
            </Button>
            <button
              className="icon-button notification-trigger"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell size={20} fill="currentColor" />
              {unread > 0 && <span>{unread}</span>}
            </button>
            <button
              className="icon-button theme-trigger"
              aria-label="Switch theme"
              onClick={() =>
                saveProfile.mutate({
                  ...profile,
                  theme: document.documentElement.classList.contains("dark")
                    ? "light"
                    : "dark",
                })
              }
            >
              <Sun size={19} />
            </button>
          </div>
          <ReferenceClock profile={profile} demo={demo} />
        </header>
        {demo && (
          <div className="demo-banner">
            <span>
              <span className="status-dot" />
              Demo workspace · synthetic data, real database
            </span>
            <Link href="/dashboard">
              Go to your private workspace <ArrowRight size={12} />
            </Link>
          </div>
        )}
        <motion.main
          className="main-content"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          {records.isLoading || profileQuery.isLoading ? (
            <div className="dashboard-skeleton">
              <div className="skeleton skeleton-hero" />
              <div className="skeleton-cards">
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="skeleton" key={i} />
                ))}
              </div>
              <div className="skeleton skeleton-body" />
            </div>
          ) : records.isError || profileQuery.isError ? (
            <div className="error-state">
              <Shield size={36} />
              <h1>Your space is temporarily unavailable.</h1>
              <p>{records.error?.message || profileQuery.error?.message}</p>
              <Button
                onClick={() => {
                  void records.refetch();
                  void profileQuery.refetch();
                }}
              >
                <RefreshCw size={16} />
                Try again
              </Button>
            </div>
          ) : route === "dashboard" ? (
            <AnalyticsDashboard
              {...props}
              demo={demo}
              saveWidgets={(widgets) =>
                saveProfile.mutate({ ...profile, widgets })
              }
            />
          ) : (
            <>
              {route !== "calendar" && route !== "tasks" && (
                <div className="page-heading">
                  <div>
                    <h1>{currentModule?.label || "Search"}</h1>
                    <p>{pageDescriptions[route] || "Your records, connected in one place."}</p>
                  </div>
                  {moduleKind && (
                    <Button onClick={() => add(moduleKind)}>
                      <Plus size={16} />
                      Add {kindLabel(moduleKind).toLowerCase()}
                    </Button>
                  )}
                </div>
              )}
              {relatedSections[route] && route !== "calendar" && route !== "tasks" && (
                <nav className="section-links" aria-label="Related sections">
                  {relatedSections[route].map((path) => {
                    const section = modules.find((module) => module.path === path)!;
                    return (
                      <Link
                        key={path}
                        href={`${demo ? "/demo" : ""}/${path}`}
                        aria-current={route === path ? "page" : undefined}
                      >
                        <section.icon size={15} /> {section.label}
                      </Link>
                    );
                  })}
                </nav>
              )}
              {route === "settings" ? (
                <SettingsPage
                  profile={profile}
                  save={(p) => saveProfile.mutate(p)}
                  api={api}
                  toast={setToast}
                  demo={demo}
                />
              ) : route === "assistant" ? (
                <AssistantPage
                  api={api}
                  profile={profile}
                  proposal={(p) => setForm({ kind: p.kind, proposal: p })}
                  navigate={navigate}
                />
              ) : route === "calendar" ? (
                <CalendarWorkspace
                  {...screenProps}
                  entities={[
                    ...items.filter((e) => e.kind !== "event"),
                    ...moduleItems,
                  ]}
                  demo={demo}
                  date={calendarDate}
                  view={calendarView}
                  onDate={setCalendarDate}
                  onView={setCalendarView}
                  onFavorite={(event) =>
                    mutation.mutate({
                      e: event,
                      changes: {
                        tags: event.tags.includes("favorite")
                          ? event.tags.filter((tag) => tag !== "favorite")
                          : [...event.tags, "favorite"],
                      },
                    })
                  }
                  onCreate={(start) =>
                    setForm({
                      kind: "event",
                      proposal: createEntitySchema.parse({
                        kind: "event",
                        title: "New event",
                        status: "scheduled",
                        dueAt: start.toISOString(),
                        data: {
                          start: start.toISOString(),
                          end: new Date(
                            start.getTime() + 3600000,
                          ).toISOString(),
                        },
                      }),
                    })
                  }
                  onCreateReminder={(start) =>
                    setForm({
                      kind: "reminder",
                      proposal: createEntitySchema.parse({
                        kind: "reminder",
                        title: "New reminder",
                        dueAt: start.toISOString(),
                        data: { channel: "in_app" },
                      }),
                    })
                  }
                  onMove={(event, start) =>
                    mutation.mutate({
                      e: event,
                      changes: {
                        dueAt: start.toISOString(),
                        data: {
                          ...event.data,
                          start: start.toISOString(),
                          end: new Date(
                            start.getTime() +
                              new Date(String(event.data.end)).getTime() -
                              new Date(String(event.data.start)).getTime(),
                          ).toISOString(),
                        },
                      },
                    })
                  }
                />
              ) : route === "tasks" ? (
                <TaskPage
                  entities={items}
                  moduleItems={moduleItems}
                  profile={profile}
                  open={open}
                  add={add}
                  navigate={navigate}
                  toggle={props.toggle}
                  update={props.update}
                />
              ) : route === "finance" ? (
                <>
                  <div className="module-overview">
                    <Card title="This month">
                      <FinanceCard {...props} />
                    </Card>
                    <Card title="Keep your finances connected">
                      <p className="muted">
                        Link transactions to your orders, appointments, projects
                        and bills. Every expense has a story.
                      </p>
                      <div className="quick-finance">
                        {(
                          [
                            "expense",
                            "income",
                            "account",
                            "budget",
                            "bill",
                            "subscription",
                          ] as EntityKind[]
                        ).map((k) => (
                          <Button
                            key={k}
                            variant="secondary"
                            onClick={() => add(k)}
                          >
                            <IconTile kind={k} />
                            {kindLabel(k)}
                          </Button>
                        ))}
                      </div>
                    </Card>
                  </div>
                  <div className="tabs finance-tabs">
                    {(
                      ["expense", "income", "account", "budget", "bill", "subscription"] as EntityKind[]
                    ).map((k) => (
                      <button
                        key={k}
                        className={financeKind === k ? "active" : ""}
                        onClick={() => setFinanceKind(k)}
                      >
                        {kindLabel(k)}
                      </button>
                    ))}
                  </div>
                  <ModuleList
                    kind={financeKind}
                    entities={moduleItems}
                    add={add}
                    open={open}
                  />
                </>
              ) : route === "health" ? (
                <>
                  <div className="module-overview">
                    <Card title="Your latest metrics">
                      <HealthCard {...props} />
                    </Card>
                    <Card title="Tracking, with peace of mind">
                      <p className="muted">
                        Keep your health records and appointments together. This
                        space helps you organize information and does not
                        provide medical diagnosis.
                      </p>
                      <Button variant="secondary" onClick={() => add("health")}>
                        Log a health metric
                      </Button>
                    </Card>
                  </div>
                  <ModuleList
                    kind="health"
                    entities={moduleItems}
                    add={add}
                    open={open}
                  />
                </>
              ) : route === "medicines" ? (
                <>
                  <Card title="Your medicine schedule">
                    <Medicines {...screenProps} />
                  </Card>
                  <p className="module-note">
                    Track medicines exactly as prescribed by your clinician.
                    Crunchrr does not recommend dosages or changes to treatment.
                  </p>
                  <ModuleList
                    kind="medicine"
                    entities={moduleItems}
                    add={add}
                    open={open}
                  />
                </>
              ) : route === "habits" ? (
                <>
                  <Card title="A little progress, every day">
                    <HabitCard {...screenProps} />
                  </Card>
                  <ModuleList
                    kind="habit"
                    entities={moduleItems}
                    add={add}
                    open={open}
                  />
                </>
              ) : route === "bills" ? (
                <>
                  <div className="toolbar">
                    <Button
                      variant="secondary"
                      onClick={() => add("subscription")}
                    >
                      <Plus size={15} />
                      Add subscription
                    </Button>
                  </div>
                  <ModuleList
                    kind="bill"
                    entities={[
                      ...moduleItems,
                      ...items.filter((e) => e.kind === "subscription"),
                    ]}
                    add={add}
                    open={open}
                  />
                </>
              ) : moduleKind ? (
                <>
                  <div className="toolbar">
                    <label className="module-search">
                      <Search size={16} />
                      <input
                        aria-label={`Search ${currentModule?.label}`}
                        placeholder={`Search ${currentModule?.label.toLowerCase()}…`}
                        value={moduleQuery}
                        onChange={(e) => setModuleQuery(e.target.value)}
                      />
                    </label>
                    <span className="muted">
                      {moduleRecords.data?.total || 0} records
                    </span>
                  </div>
                  {moduleRecords.isLoading ? (
                    <div className="skeleton skeleton-body" />
                  ) : moduleRecords.isError ? (
                    <p role="alert">{moduleRecords.error.message}</p>
                  ) : (
                    <ModuleList
                      kind={moduleKind}
                      entities={moduleItems}
                      add={add}
                      open={open}
                    />
                  )}
                </>
              ) : (
                <p>Choose a section from the sidebar.</p>
              )}
              {moduleRecords.data && moduleRecords.data.total > 100 && (
                <div className="pagination">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span>Page {page}</span>
                  <Button
                    variant="secondary"
                    disabled={page * 100 >= moduleRecords.data.total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.main>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {[
          { path: "dashboard", label: "Home", icon: LayoutDashboard },
          { path: "calendar", label: "Calendar", icon: CalendarDays },
          { path: "tasks", label: "Tasks", icon: SquareCheck },
        ].map((m) => (
          <button
            key={m.path}
            className={route === m.path ? "active" : ""}
            onClick={() => navigate(m.path)}
          >
            <m.icon size={21} />
            <span>{m.label}</span>
          </button>
        ))}
        <button onClick={() => setSearchOpen(true)}>
          <Search size={21} />
          <span>Search</span>
        </button>
        <button onClick={() => setModulesOpen(true)}>
          <Menu size={21} />
          <span>More</span>
        </button>
      </nav>
      <button
        className="floating-add"
        aria-label="Quick add"
        onClick={() => add("task")}
      >
        <Plus size={25} />
      </button>
      <Dialog
        open={modulesOpen}
        onOpenChange={setModulesOpen}
        title="All of your life"
        description="A connected space for your plans, people and little things."
      >
        <div className="all-modules-grid">
          {modules.map((m) => (
            <Link
              key={m.path}
              href={`${demo ? "/demo" : ""}/${m.path}`}
              onClick={() => setModulesOpen(false)}
            >
              <m.icon size={20} />
              <span>{m.label}</span>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
      </Dialog>
      <Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search your life"
        description="Find a record, its context, or your next action."
        wide
      >
        <div className="command-input">
          <Search size={20} />
          <input
            autoFocus
            placeholder="Search anything…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search all records"
          />
          <kbd>Esc</kbd>
        </div>
        <div className="command-results">
          {search.trim() ? (
            searchResults.isLoading ? (
              <div className="skeleton" />
            ) : searchResults.isError ? (
              <p role="alert">{searchResults.error.message}</p>
            ) : searchResults.data?.items.length ? (
              searchResults.data.items.map((e) => (
                <RecordRow key={e.id} entity={e} open={open} />
              ))
            ) : (
              <p className="empty">No records found. Try a different phrase.</p>
            )
          ) : (
            <>
              <h3>Quick actions</h3>
              {entityKinds
                .filter((k) => !["account", "income", "budget"].includes(k))
                .map((k) => (
                  <button
                    className="command-action"
                    key={k}
                    onClick={() => add(k)}
                  >
                    <IconTile kind={k} />
                    <span>Create {kindLabel(k).toLowerCase()}</span>
                    <Plus size={15} />
                  </button>
                ))}
              <button
                className="command-action"
                onClick={() => {
                  setSearchOpen(false);
                  navigate("assistant");
                }}
              >
                <Sparkles size={20} />
                Open AI assistant
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </Dialog>
      <Dialog
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        title="Notifications"
        description="The important things, at the right time."
      >
        <div className="notification-list">
          {notifications.data?.length ? (
            notifications.data.map((n) => (
              <button
                key={n.id}
                className={`notification-row ${!n.read ? "unread" : ""}`}
                onClick={async () => {
                  await api.readNotification(n.id);
                  await client.invalidateQueries({
                    queryKey: ["notifications", key],
                  });
                  if (n.entityId) {
                    setSelected(await api.get(n.entityId));
                    setNotificationsOpen(false);
                  }
                }}
              >
                <Bell size={18} />
                <span>
                  <strong>{n.title}</strong>
                  <small>
                    {format(new Date(n.createdAt), "MMM d · h:mm a")}
                  </small>
                </span>
                {!n.read && <i className="status-dot" />}
              </button>
            ))
          ) : (
            <div className="empty">
              <Bell size={30} />
              <h3>You’re all caught up.</h3>
              <p>New reminders will appear here.</p>
            </div>
          )}
        </div>
      </Dialog>
      {entity && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v) {
              setSelected(null);
              if (entityId) navigate(route);
            }
          }}
          title={entity.title}
          description={`${kindLabel(entity.kind)} · ${entity.status.replaceAll("_", " ")} · Updated ${format(new Date(entity.updatedAt), "MMM d, h:mm a")}`}
          wide
        >
          <div className="entity-detail">
            <div className="detail-toolbar">
              <IconTile kind={entity.kind} />
              <span className="badge">{entity.priority} priority</span>
              {entity.dueAt && (
                <span className="muted">
                  {format(new Date(entity.dueAt), "MMM d, yyyy · h:mm a")}
                </span>
              )}
              <Button
                variant="secondary"
                onClick={() => setForm({ kind: entity.kind, entity })}
              >
                <Pencil size={14} />
                Edit
              </Button>
            </div>
            {entity.description && (
              <p className="detail-description">{entity.description}</p>
            )}
            {entity.kind === "note" &&
              typeof entity.data.content === "string" && (
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {entity.data.content}
                  </ReactMarkdown>
                </div>
              )}
            <dl className="detail-data">
              {Object.entries(entity.data)
                .filter(([k, v]) => v !== "" && v !== null && k !== "content")
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k.replace(/([A-Z])/g, " $1").replaceAll("_", " ")}</dt>
                    <dd>
                      {Array.isArray(v)
                        ? v.length
                          ? JSON.stringify(v)
                          : "None"
                        : typeof v === "object"
                          ? JSON.stringify(v)
                          : String(v)}
                    </dd>
                  </div>
                ))}
            </dl>
            {entity.kind === "document" &&
              typeof entity.data.fileId === "string" && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const result = await api.download(
                        String(entity.data.fileId),
                      );
                      window.open(result.url, "_blank", "noopener,noreferrer");
                    } catch (e) {
                      setToast(
                        e instanceof Error ? e.message : "Download unavailable",
                      );
                    }
                  }}
                >
                  <Download size={14} />
                  Download private file
                </Button>
              )}
            <div className="life-graph-heading">
              <span className="metric-icon purple">
                <Link2 size={19} />
              </span>
              <div>
                <h3>Connected in your Life Graph</h3>
                <p className="muted">
                  The context that makes this more than a record.
                </p>
              </div>
            </div>
            <div className="related-list">
              {links.isLoading ? (
                <div className="skeleton" />
              ) : links.isError ? (
                <p role="alert">{links.error.message}</p>
              ) : links.data?.length ? (
                links.data.map((l) => (
                  <div className="related-row" key={l.id}>
                    <button
                      onClick={() => {
                        if (entityId)
                          navigate(`${routeFor(l.entity.kind)}/${l.entity.id}`);
                        else setSelected(l.entity);
                      }}
                    >
                      <IconTile kind={l.entity.kind} />
                      <span>
                        <strong>{l.entity.title}</strong>
                        <small>
                          {kindLabel(l.entity.kind)} ·{" "}
                          {l.relationship.replaceAll("_", " ")}
                        </small>
                      </span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Unlink ${l.entity.title}`}
                      onClick={async () => {
                        try {
                          await api.unlink(l.id);
                          await invalidate();
                          setToast("Link removed");
                        } catch (e) {
                          setToast(
                            e instanceof Error ? e.message : "Unable to unlink",
                          );
                        }
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">
                  No connections yet. Link a task, event, expense or other
                  record below.
                </p>
              )}
            </div>
            <label className="link-search-label">
              Search your records
              <input
                aria-label="Search records to connect"
                value={linkQuery}
                placeholder="Find a task, project, expense…"
                onChange={(e) => setLinkQuery(e.target.value)}
              />
            </label>
            <div className="link-form">
              <select
                aria-label="Record to link"
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value)}
              >
                <option value="">Choose a related record…</option>
                {(linkQuery.trim().length > 1
                  ? linkCandidates.data?.items || []
                  : items
                )
                  .filter((e) => e.id !== entity.id)
                  .map((e) => (
                    <option value={e.id} key={e.id}>
                      {kindLabel(e.kind)} · {e.title}
                    </option>
                  ))}
              </select>
              <Button
                disabled={!linkTarget}
                onClick={async () => {
                  try {
                    await api.link(entity.id, linkTarget);
                    setLinkTarget("");
                    await invalidate();
                    setToast("Records connected");
                  } catch (e) {
                    setToast(e instanceof Error ? e.message : "Unable to link");
                  }
                }}
              >
                <Link2 size={15} />
                Connect
              </Button>
            </div>
            <div className="detail-footer">
              <Button
                variant="danger"
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Delete “${entity.title}”? Its links will also be removed.`,
                    )
                  )
                    return;
                  try {
                    await api.remove(entity.id);
                    setSelected(null);
                    if (entityId) navigate(route);
                    await invalidate();
                    setToast("Record deleted");
                  } catch (e) {
                    setToast(
                      e instanceof Error ? e.message : "Unable to delete",
                    );
                  }
                }}
              >
                <Trash2 size={14} />
                Delete record
              </Button>
              <span className="muted">Private to your workspace</span>
            </div>
          </div>
        </Dialog>
      )}
      {form && (
        <EntityForm
          key={`${form.kind}-${form.entity?.id || "new"}`}
          {...form}
          open
          api={api}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      {profileQuery.data && !profile.onboarded && !demo && (
        <Onboarding
          profile={profile}
          onSave={async (p) => {
            await saveProfile.mutateAsync(p);
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function RecordRow({
  entity: e,
  open,
}: {
  entity: Entity;
  open: (e: Entity) => void;
}) {
  return (
    <button className="record-row" onClick={() => open(e)}>
      <IconTile kind={e.kind} />
      <span>
        <strong>{e.title}</strong>
        <small>
          {kindLabel(e.kind)} · {e.description || e.status.replaceAll("_", " ")}
        </small>
      </span>
      {typeof e.data.amount === "number" && (
        <strong>
          {money(e.data.amount, String(e.data.currency || "INR"))}
        </strong>
      )}
      {e.dueAt && <time>{format(new Date(e.dueAt), "MMM d")}</time>}
      <ArrowRight size={16} />
    </button>
  );
}
function ModuleList({
  kind,
  entities,
  open,
  add,
}: {
  kind: EntityKind;
  entities: Entity[];
  open: (e: Entity) => void;
  add: (kind: EntityKind) => void;
}) {
  return (
    <Card title={`${kindLabel(kind)} records`}>
      <div className="entity-list">
        {entities.length ? (
          entities.map((e) => <RecordRow key={e.id} entity={e} open={open} />)
        ) : (
          <Empty kind={kind} add={add} />
        )}
      </div>
    </Card>
  );
}
function AssistantPage({
  api,
  profile,
  proposal,
  navigate,
}: {
  api: ApiClient;
  profile: Profile;
  proposal: (p: CreateEntity) => void;
  navigate: (p: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<
    { role: string; text: string; proposal?: CreateEntity | null }[]
  >([]);
  const [busy, setBusy] = useState(false);
  async function send(text = message) {
    if (!text.trim()) return;
    setMessage("");
    setChat((c) => [...c, { role: "You", text }]);
    setBusy(true);
    try {
      const result = await api.assistant(text);
      setChat((c) => [
        ...c,
        { role: "crunchrr", text: result.text, proposal: result.proposal },
      ]);
    } catch (e) {
      setChat((c) => [
        ...c,
        {
          role: "crunchrr",
          text:
            e instanceof Error
              ? e.message
              : "Your assistant is unavailable. Try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card assistant-workspace">
      <div className="assistant-welcome">
        <span className="assistant-orb">
          <Sparkles size={32} />
        </span>
        <h2>Make a little room for clarity.</h2>
        <p>Your plans, priorities and possibilities — connected.</p>
        {!profile.aiPermissions.length && (
          <Button variant="secondary" onClick={() => navigate("settings")}>
            <Shield size={16} />
            Choose what AI can access
          </Button>
        )}
      </div>
      <div className="assistant-suggestions">
        {[
          "What do I have tomorrow?",
          "Plan my day.",
          "What bills are due this week?",
          "Create a task to read tomorrow.",
        ].map((t) => (
          <button onClick={() => void send(t)} disabled={busy} key={t}>
            {t}
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
      <div className="chat-messages" aria-live="polite">
        {chat.map((m, i) => (
          <article
            key={i}
            className={`chat-message ${m.role === "You" ? "chat-user" : ""}`}
          >
            <strong>{m.role}</strong>
            <p>{m.text}</p>
            {m.proposal && (
              <div className="ai-proposal">
                <IconTile kind={m.proposal.kind} />
                <span>
                  {m.proposal.title}
                  <small>Review all details before saving</small>
                </span>
                <Button onClick={() => proposal(m.proposal!)}>
                  Review & confirm
                </Button>
              </div>
            )}
          </article>
        ))}
        {busy && <div className="skeleton" />}
      </div>
      <form
        className="assistant-input"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          aria-label="Message crunchrr"
          placeholder="Ask about your life, or plan your next step…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
        />
        <Button disabled={busy || !message.trim()} aria-label="Send message">
          <Send size={19} />
        </Button>
      </form>
      <p className="assistant-disclaimer">
        You control access. Changes require review. Health and finance responses
        are informational.
      </p>
    </section>
  );
}
function SettingsPage({
  profile,
  save,
  api,
  toast,
  demo,
}: {
  profile: Profile;
  save: (p: Profile) => void;
  api: ApiClient;
  toast: (m: string) => void;
  demo: boolean;
}) {
  const [draft, setDraft] = useState(profile);
  const [deleteText, setDeleteText] = useState("");
  const update = (changes: Partial<Profile>) =>
    setDraft({ ...draft, ...changes });
  const widgets = [
    "schedule",
    "tasks",
    "finance",
    "health",
    "medicines",
    "orders",
    "bills",
    "habits",
    "goals",
    "meals",
  ];
  async function exportData(csv = false) {
    try {
      const data = await api.exportData();
      const content = csv
        ? [
            "kind,title,status,dueAt",
            ...data.entities.map((e) =>
              [e.kind, e.title, e.status, e.dueAt || ""]
                .map((v) => `"${String(v).replaceAll('"', '""')}"`)
                .join(","),
            ),
          ].join("\n")
        : JSON.stringify(data, null, 2);
      const blob = new Blob([content], {
        type: csv ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `crunchrr-export.${csv ? "csv" : "json"}`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast("Export downloaded");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Export failed");
    }
  }
  return (
    <div className="settings-grid">
      <Card title="Your profile">
        <form
          className="entity-form"
          onSubmit={(e) => {
            e.preventDefault();
            save(draft);
          }}
        >
          <label>
            Name
            <input
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
              required
              maxLength={100}
            />
          </label>
          <label>
            Timezone
            <input
              value={draft.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
            />
          </label>
          <label>
            Currency
            <select
              value={draft.currency}
              onChange={(e) => update({ currency: e.target.value })}
            >
              {["INR", "USD", "EUR", "GBP", "JPY"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Appearance
            <select
              value={draft.theme}
              onChange={(e) =>
                update({ theme: e.target.value as Profile["theme"] })
              }
            >
              {["light", "dark", "system"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={draft.notifications}
              onChange={(e) => update({ notifications: e.target.checked })}
            />
            Enable in-app reminders
          </label>
          <Button>Save preferences</Button>
        </form>
      </Card>
      <Card title="AI permissions">
        <p className="muted">
          Only selected modules can be accessed by the assistant. You can revoke
          access at any time.
        </p>
        <div className="permission-grid">
          {entityKinds.map((k) => (
            <label key={k} className="checkbox-label">
              <input
                type="checkbox"
                checked={draft.aiPermissions.includes(k)}
                onChange={(e) =>
                  update({
                    aiPermissions: e.target.checked
                      ? [...draft.aiPermissions, k]
                      : draft.aiPermissions.filter((v) => v !== k),
                  })
                }
              />
              {kindLabel(k)}
            </label>
          ))}
        </div>
        <Button onClick={() => save(draft)}>Save AI permissions</Button>
      </Card>
      <Card title="Your dashboard">
        <p className="muted">
          Choose the information you want to see each day.
        </p>
        <div className="permission-grid">
          {widgets.map((w) => (
            <label className="checkbox-label" key={w}>
              <input
                type="checkbox"
                checked={!draft.widgets.includes(`hide:${w}`)}
                onChange={(e) =>
                  update({
                    widgets: e.target.checked
                      ? draft.widgets.filter((v) => v !== `hide:${w}`)
                      : [...draft.widgets, `hide:${w}`],
                  })
                }
              />
              {w.charAt(0).toUpperCase() + w.slice(1)}
            </label>
          ))}
        </div>
        <Button onClick={() => save(draft)}>Save dashboard</Button>
      </Card>
      <Card title="Your data, your choice">
        <p className="muted">
          Download all your records and Life Graph connections.
        </p>
        <div className="data-actions">
          <Button variant="secondary" onClick={() => void exportData()}>
            <Download size={16} />
            Export JSON
          </Button>
          <Button variant="secondary" onClick={() => void exportData(true)}>
            Export CSV
          </Button>
        </div>
        <hr />
        <h3>Delete your account</h3>
        <p className="muted">
          Permanently delete personal records, files, relationships and your
          Clerk account. This cannot be undone.
        </p>
        <label className="delete-confirm">
          Type DELETE MY ACCOUNT
          <input
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
          />
        </label>
        <Button
          variant="danger"
          disabled={deleteText !== "DELETE MY ACCOUNT" || demo}
          onClick={async () => {
            if (
              !window.confirm("Permanently delete your account and all data?")
            )
              return;
            try {
              await api.deleteAccount();
              window.location.href = "/";
            } catch (e) {
              toast(e instanceof Error ? e.message : "Account deletion failed");
            }
          }}
        >
          Delete account permanently
        </Button>
      </Card>
    </div>
  );
}
function Onboarding({
  profile,
  onSave,
}: {
  profile: Profile;
  onSave: (p: Profile) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const titles = [
    "Welcome to crunchrr.",
    "What should we call you?",
    "Make it your own.",
    "You’re in control.",
  ];
  return (
    <Dialog
      open
      onOpenChange={() => {}}
      title={titles[step]!}
      description="A little setup for a more connected everyday."
    >
      <div className="onboarding">
        <div className="onboarding-progress">
          {titles.map((_, i) => (
            <i className={i <= step ? "active" : ""} key={i} />
          ))}
        </div>
        {step === 0 ? (
          <>
            <img src="/hero.webp" alt="Crunchrr mascot overlooking mountains" />
            <h2>One place. All of you.</h2>
            <p>
              Bring your plans, priorities and little things together. You can
              add more as you go.
            </p>
          </>
        ) : step === 1 ? (
          <label>
            Your name
            <input
              value={draft.name === "Friend" ? "" : draft.name}
              placeholder="Your name"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
        ) : step === 2 ? (
          <>
            <label>
              Timezone
              <input
                value={draft.timezone}
                onChange={(e) =>
                  setDraft({ ...draft, timezone: e.target.value })
                }
              />
            </label>
            <label>
              Currency
              <select
                value={draft.currency}
                onChange={(e) =>
                  setDraft({ ...draft, currency: e.target.value })
                }
              >
                {["INR", "USD", "EUR", "GBP"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <Shield size={35} />
            <p>
              AI access starts disabled. Choose permissions later in Settings.
              You decide what your assistant can see.
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={draft.notifications}
                onChange={(e) =>
                  setDraft({ ...draft, notifications: e.target.checked })
                }
              />
              Enable in-app notifications
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="form-actions">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            disabled={busy || (step === 1 && !draft.name.trim())}
            onClick={async () => {
              if (step < 3) {
                setStep((s) => s + 1);
                return;
              }
              setBusy(true);
              try {
                await onSave({ ...draft, onboarded: true });
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Setup could not be saved",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy
              ? "Saving…"
              : step === 3
                ? "Make yourself at home"
                : "Continue"}
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
