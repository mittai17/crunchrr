import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
  ImageBackground,
  ScrollView,
  Switch,
  useColorScheme,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import {
  Plus,
  ChevronRight,
  Link2,
  Check,
  Sparkles,
  Sun,
  Search as SearchIcon,
} from "lucide-react-native";
import { useAuth } from "@clerk/clerk-expo";
import {
  type Entity,
  type EntityKind,
  entityKinds,
  kindSchema,
  createEntitySchema,
} from "@crunchrr/validation";
import {
  money,
  numeric,
  dayKey,
  dashboardStats,
  domainFields,
  defaultData,
} from "@crunchrr/utils";
import { useApi } from "./context";
const labels: Record<EntityKind, string> = {
  task: "Tasks",
  event: "Calendar",
  reminder: "Reminders",
  note: "Notes",
  expense: "Finance",
  income: "Income",
  account: "Accounts",
  budget: "Budgets",
  health: "Health",
  medicine: "Medicines",
  goal: "Goals",
  habit: "Habits",
  wellbeing: "Wellbeing",
  project: "Projects",
  person: "People",
  meal: "Meals",
  trip: "Travel",
  vehicle: "Vehicles",
  shopping: "Shopping",
  order: "Orders",
  bill: "Bills",
  subscription: "Subscriptions",
  document: "Life Vault",
};
const baseStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f7fb" },
  content: { padding: 18, paddingBottom: 95, gap: 14 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 14 },
  title: { fontSize: 23, fontWeight: "700", color: "#111827" },
  heading: { fontSize: 18, fontWeight: "600", color: "#111827" },
  body: { fontSize: 16, color: "#111827", lineHeight: 24 },
  muted: { fontSize: 13, color: "#64748b", lineHeight: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    minHeight: 52,
  },
  grow: { flex: 1 },
  button: {
    backgroundColor: "#6d3df5",
    borderRadius: 10,
    padding: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#dce0eb",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 13,
    minHeight: 48,
    fontSize: 16,
    color: "#111827",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: "#6d3df5",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  badge: {
    fontSize: 12,
    color: "#6d3df5",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  error: { fontSize: 14, color: "#cc3344", lineHeight: 21 },
  hero: {
    height: 215,
    borderRadius: 16,
    overflow: "hidden",
    padding: 20,
    justifyContent: "center",
    gap: 7,
  },
  heroTitle: { color: "#fff", fontSize: 29, fontWeight: "700" },
  heroBody: { color: "#f4eeff", fontSize: 15, lineHeight: 23 },
  kpis: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpi: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    gap: 6,
  },
  check: {
    height: 28,
    width: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#a2adbf",
    alignItems: "center",
    justifyContent: "center",
  },
  complete: { backgroundColor: "#6d3df5", borderColor: "#6d3df5" },
});
export function useStyles() {
  const dark = useColorScheme() === "dark";
  return {
    ...baseStyles,
    screen: {
      ...baseStyles.screen,
      backgroundColor: dark ? "#080b14" : "#f6f7fb",
    },
    card: { ...baseStyles.card, backgroundColor: dark ? "#111827" : "#fff" },
    kpi: { ...baseStyles.kpi, backgroundColor: dark ? "#111827" : "#fff" },
    title: { ...baseStyles.title, color: dark ? "#f1f5f9" : "#111827" },
    heading: { ...baseStyles.heading, color: dark ? "#f1f5f9" : "#111827" },
    body: { ...baseStyles.body, color: dark ? "#f1f5f9" : "#111827" },
    muted: { ...baseStyles.muted, color: dark ? "#a0acc5" : "#64748b" },
    input: {
      ...baseStyles.input,
      backgroundColor: dark ? "#172033" : "#fff",
      color: dark ? "#f1f5f9" : "#111827",
      borderColor: dark ? "#344058" : "#dce0eb",
    },
  };
}

function Fab({ kind = "task" }: { kind?: EntityKind }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityLabel="Quick add"
      style={styles.fab}
      onPress={() => {
        void Haptics.selectionAsync();
        router.push({ pathname: "/create", params: { kind } });
      }}
    >
      <Plus size={26} color="#fff" />
    </Pressable>
  );
}
function Row({
  entity: e,
  onToggle,
}: {
  entity: Entity;
  onToggle?: (e: Entity) => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      style={styles.row}
      onPress={() =>
        router.push({ pathname: "/record/[id]", params: { id: e.id } })
      }
      onLongPress={() =>
        Alert.alert(e.title, "Open or edit this record", [
          { text: "Cancel" },
          {
            text: "Edit",
            onPress: () =>
              router.push({
                pathname: "/create",
                params: { kind: e.kind, id: e.id },
              }),
          },
        ])
      }
    >
      {onToggle && (
        <Pressable
          hitSlop={10}
          accessibilityLabel={`Toggle ${e.title}`}
          style={[styles.check, e.status === "completed" && styles.complete]}
          onPress={() => onToggle(e)}
        >
          {e.status === "completed" && <Check size={18} color="#fff" />}
        </Pressable>
      )}
      <View style={styles.grow}>
        <Text style={styles.body}>{e.title}</Text>
        <Text style={styles.muted}>
          {labels[e.kind]} ·{" "}
          {e.dueAt ? new Date(e.dueAt).toLocaleDateString() : e.status}
        </Text>
      </View>
      {typeof e.data.amount === "number" && (
        <Text style={styles.badge}>{money(e.data.amount)}</Text>
      )}
      <ChevronRight size={18} color="#a0acc1" />
    </Pressable>
  );
}
export function HomeScreen() {
  const styles = useStyles();
  const api = useApi();
  const records = useQuery({
      queryKey: ["records"],
      queryFn: () => api.list(),
    }),
    profile = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  const e = records.data?.items || [];
  const stats = dashboardStats(e, profile.data?.timezone || "Asia/Kolkata");
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={records.isRefetching}
            onRefresh={() => {
              void records.refetch();
              void profile.refetch();
            }}
            tintColor="#6d3df5"
          />
        }
      >
        <ImageBackground
          source={require("../assets/hero.webp")}
          style={styles.hero}
          imageStyle={{ borderRadius: 16 }}
        >
          <Text style={styles.heroBody}>Welcome back,</Text>
          <Text style={styles.heroTitle}>{profile.data?.name || "Friend"}</Text>
          <Text style={styles.heroBody}>
            Everything important,{`\n`}in one place.
          </Text>
        </ImageBackground>
        {records.isError && (
          <Text style={styles.error}>{records.error.message}</Text>
        )}
        <View style={styles.kpis}>
          {[
            { label: "Tasks", value: `${stats.completed} / ${stats.tasks}` },
            { label: "Events today", value: String(stats.events) },
            { label: "Spent today", value: money(stats.expenses) },
            {
              label: "Medicines taken",
              value: `${stats.taken} / ${stats.medicines}`,
            },
          ].map((k) => (
            <View style={styles.kpi} key={k.label}>
              <Text style={styles.muted}>{k.label}</Text>
              <Text style={styles.title}>{k.value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>Today’s schedule</Text>
          {e
            .filter(
              (e) =>
                e.kind === "event" &&
                dayKey(new Date(String(e.data.start))) === dayKey(),
            )
            .map((e) => (
              <Row entity={e} key={e.id} />
            ))}
          {!e.some((e) => e.kind === "event") && (
            <Text style={styles.muted}>
              Your day has room for something good. Add an event to start.
            </Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>A connected life</Text>
          {e
            .filter((e) => ["goal", "project", "medicine"].includes(e.kind))
            .slice(0, 4)
            .map((e) => (
              <Row entity={e} key={e.id} />
            ))}
        </View>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/assistant")}
        >
          <Text style={styles.buttonText}>Ask crunchrr</Text>
        </Pressable>
      </ScrollView>
      <Fab />
    </View>
  );
}
export function ListScreen({ kind: fixedKind }: { kind?: EntityKind }) {
  const styles = useStyles();
  const params = useLocalSearchParams<{ kind: string }>();
  const kind = fixedKind || kindSchema.parse(params.kind);
  const api = useApi(),
    client = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const records = useQuery({
    queryKey: ["module", kind, q, page],
    queryFn: () => api.list(kind, q || undefined, page),
  });
  async function toggle(e: Entity) {
    try {
      await api.update(e, {
        status: e.status === "completed" ? "todo" : "completed",
      });
      await client.invalidateQueries();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : "Try again",
      );
    }
  }
  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={records.data?.items || []}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Row
              entity={item}
              onToggle={kind === "task" ? toggle : undefined}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>{labels[kind]}</Text>
            <TextInput
              style={[styles.input, { marginVertical: 14 }]}
              placeholder={`Search ${labels[kind].toLowerCase()}…`}
              accessibilityLabel="Search records"
              value={q}
              onChangeText={(text) => {
                setQ(text);
                setPage(1);
              }}
            />
            {records.isError && (
              <Text style={styles.error}>{records.error.message}</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.card}>
            <Text style={styles.heading}>
              {records.isLoading ? "Loading your space…" : "A fresh start."}
            </Text>
            <Text style={styles.muted}>
              Add your first record. Connect the details as you go.
            </Text>
          </View>
        }
        ListFooterComponent={
          records.data && records.data.total > 100 ? (
            <View style={styles.row}>
              <Pressable
                style={styles.button}
                disabled={page === 1}
                onPress={() => setPage((p) => p - 1)}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </Pressable>
              <Text>{page}</Text>
              <Pressable
                style={styles.button}
                disabled={page * 100 >= records.data.total}
                onPress={() => setPage((p) => p + 1)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </Pressable>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl
            refreshing={records.isRefetching}
            onRefresh={() => void records.refetch()}
            tintColor="#6d3df5"
          />
        }
      />
      <Fab kind={kind} />
    </View>
  );
}
export function SearchScreen() {
  const styles = useStyles();
  const api = useApi();
  const [q, setQ] = useState("");
  const results = useQuery({
    queryKey: ["search", q],
    queryFn: () => api.list(undefined, q),
    enabled: q.trim().length > 1,
  });
  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={results.data?.items || []}
        keyExtractor={(e) => e.id}
        ListHeaderComponent={
          <TextInput
            style={[styles.input, { marginBottom: 15 }]}
            value={q}
            onChangeText={setQ}
            placeholder="Search your entire life…"
            autoCapitalize="none"
            accessibilityLabel="Universal search"
          />
        }
        renderItem={({ item }) => <Row entity={item} />}
        ListEmptyComponent={
          <Text style={styles.muted}>
            {results.isError
              ? results.error.message
              : q.length > 1
                ? "No records found."
                : "Find a record and its connected context."}
          </Text>
        }
      />
    </View>
  );
}
export function MoreScreen() {
  const styles = useStyles();
  const { signOut } = useAuth();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        {entityKinds
          .filter(
            (k) =>
              !["task", "event", "account", "income", "budget"].includes(k),
          )
          .map((k) => (
            <Pressable
              key={k}
              style={styles.row}
              onPress={() =>
                router.push({ pathname: "/module/[kind]", params: { kind: k } })
              }
            >
              <Text style={[styles.body, styles.grow]}>{labels[k]}</Text>
              <ChevronRight size={18} color="#64748b" />
            </Pressable>
          ))}
        <Pressable style={styles.row} onPress={() => router.push("/assistant")}>
          <Text style={styles.body}>AI Assistant</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => router.push("/settings")}>
          <Text style={styles.body}>Settings & privacy</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => void signOut()}>
          <Text style={[styles.body, { color: "#d43b53" }]}>Sign out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
export function EntityScreen() {
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useApi();
  const client = useQueryClient();
  const record = useQuery({
      queryKey: ["record", id],
      queryFn: () => api.get(id),
    }),
    links = useQuery({ queryKey: ["links", id], queryFn: () => api.links(id) }),
    all = useQuery({ queryKey: ["records"], queryFn: () => api.list() });
  const [linking, setLinking] = useState(false);
  const e = record.data;
  if (!e)
    return (
      <View style={styles.content}>
        <Text style={styles.muted}>
          {record.error?.message || "Loading record…"}
        </Text>
      </View>
    );
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.badge}>{labels[e.kind]}</Text>
        <Text style={styles.title}>{e.title}</Text>
        <Text style={styles.muted}>
          {e.status} · {e.priority} priority
        </Text>
        {e.description && <Text style={styles.body}>{e.description}</Text>}
        {Object.entries(e.data).map(([k, v]) => (
          <View key={k}>
            <Text style={styles.muted}>{k}</Text>
            <Text style={styles.body}>
              {typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
            </Text>
          </View>
        ))}
        <Pressable
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/create",
              params: { kind: e.kind, id: e.id },
            })
          }
        >
          <Text style={styles.buttonText}>Edit record</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Connected in your Life Graph</Text>
        {links.data?.map((l) => (
          <Row key={l.id} entity={l.entity} />
        ))}
        {links.isError && (
          <Text style={styles.error}>{links.error.message}</Text>
        )}
        {!links.data?.length && (
          <Text style={styles.muted}>
            Link this record to its related tasks, expenses and plans.
          </Text>
        )}
        <Pressable style={styles.button} onPress={() => setLinking(true)}>
          <Text style={styles.buttonText}>Connect a record</Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.row}
        onPress={() =>
          Alert.alert("Delete record?", e.title, [
            { text: "Cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                void api
                  .remove(e.id)
                  .then(() => {
                    void client.invalidateQueries();
                    router.back();
                  })
                  .catch((error) =>
                    Alert.alert("Delete failed", error.message),
                  );
              },
            },
          ])
        }
      >
        <Text style={[styles.body, { color: "#d43b53" }]}>Delete record</Text>
      </Pressable>
      <Modal
        visible={linking}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLinking(false)}
      >
        <View style={[styles.screen, { paddingTop: 40 }]}>
          <Pressable style={styles.row} onPress={() => setLinking(false)}>
            <Text style={styles.body}>Cancel</Text>
          </Pressable>
          <FlatList
            contentContainerStyle={styles.content}
            data={all.data?.items.filter((v) => v.id !== e.id) || []}
            keyExtractor={(v) => v.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={async () => {
                  try {
                    await api.link(e.id, item.id);
                    await client.invalidateQueries({ queryKey: ["links", id] });
                    setLinking(false);
                  } catch (error) {
                    Alert.alert(
                      "Could not connect",
                      error instanceof Error ? error.message : "Try again",
                    );
                  }
                }}
              >
                <Text style={styles.body}>{item.title}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
function DateTimeField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const styles = useStyles();
  const [mode, setMode] = useState<"date" | "time" | null>(null);
  const date =
    value && Number.isFinite(new Date(value).getTime())
      ? new Date(value)
      : new Date();
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.muted}>{label} · local time</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          style={[styles.input, { flex: 1, justifyContent: "center" }]}
          accessibilityLabel={`${label}, choose date`}
          onPress={() => setMode("date")}
        >
          <Text style={styles.body}>
            {value ? date.toLocaleDateString() : "Set a date"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.input, { justifyContent: "center" }]}
          accessibilityLabel={`${label}, choose time`}
          onPress={() => setMode("time")}
        >
          <Text style={styles.body}>
            {value
              ? date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Time"}
          </Text>
        </Pressable>
      </View>
      {mode && (
        <>
          <DateTimePicker
            value={date}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_event, next) => {
              if (Platform.OS === "android") setMode(null);
              if (next) onChange(next.toISOString());
            }}
          />
          {Platform.OS === "ios" && (
            <Pressable style={styles.button} onPress={() => setMode(null)}>
              <Text style={styles.buttonText}>Done</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}
export function CreateScreen() {
  const styles = useStyles();
  const params = useLocalSearchParams<{ kind: string; id?: string }>();
  const kind = kindSchema.parse(params.kind || "task");
  const api = useApi(),
    client = useQueryClient();
  const existing = useQuery({
    queryKey: ["record", params.id],
    queryFn: () => api.get(params.id!),
    enabled: !!params.id,
  });
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [data, setData] = useState(defaultData(kind));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  if (existing.data && !hydrated) {
    setHydrated(true);
    setTitle(existing.data.title);
    setDue(existing.data.dueAt || "");
    setData(existing.data.data);
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const value = createEntitySchema.parse({
        title,
        kind,
        data,
        dueAt: due ? new Date(due).toISOString() : null,
      });
      if (existing.data)
        await api.update(existing.data, {
          title: value.title,
          data: value.data,
          dueAt: value.dueAt,
        });
      else await api.create(value);
      await client.invalidateQueries();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save. Check the details.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={styles.title}>
        {existing.data ? "Edit" : "Add"} {labels[kind]}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        accessibilityLabel="Title"
        value={title}
        onChangeText={setTitle}
      />
      <DateTimeField value={due} onChange={setDue} label="Due date" />
      {domainFields[kind].map((f) => (
        <View key={f.key} style={{ gap: 8 }}>
          <Text style={styles.muted}>{f.label}</Text>
          {f.options ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {f.options.map((o) => (
                <Pressable
                  key={o}
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        data[f.key] === o ? "#6d3df5" : "#ede9fe",
                    },
                  ]}
                  onPress={() => setData({ ...data, [f.key]: o })}
                >
                  <Text
                    style={{ color: data[f.key] === o ? "#fff" : "#6d3df5" }}
                  >
                    {o}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : f.type === "datetime-local" ? (
            <DateTimeField
              value={String(data[f.key] || "")}
              onChange={(value) => setData({ ...data, [f.key]: value })}
              label={f.label}
            />
          ) : (
            <TextInput
              style={styles.input}
              value={String(data[f.key] ?? "")}
              onChangeText={(v) =>
                setData({
                  ...data,
                  [f.key]: f.type === "number" ? Number(v) : v,
                })
              }
              keyboardType={f.type === "number" ? "decimal-pad" : "default"}
              multiline={f.type === "textarea"}
              accessibilityLabel={f.label}
            />
          )}
        </View>
      ))}
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        style={styles.button}
        disabled={busy || !title.trim()}
        onPress={() => void save()}
      >
        <Text style={styles.buttonText}>
          {busy ? "Saving…" : "Save record"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
export function SettingsScreen() {
  const styles = useStyles();
  const api = useApi(),
    client = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: api.profile });
  if (!profile.data)
    return (
      <Text style={styles.muted}>
        {profile.error?.message || "Loading settings…"}
      </Text>
    );
  const p = profile.data;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your privacy</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>AI access</Text>
        <Text style={styles.muted}>
          Only the modules you enable can be accessed by the assistant.
        </Text>
        {entityKinds.map((k) => (
          <View style={styles.row} key={k}>
            <Text style={[styles.body, styles.grow]}>{labels[k]}</Text>
            <Switch
              value={p.aiPermissions.includes(k)}
              trackColor={{ true: "#6d3df5" }}
              onValueChange={async (v) => {
                try {
                  await api.saveProfile({
                    ...p,
                    aiPermissions: v
                      ? [...p.aiPermissions, k]
                      : p.aiPermissions.filter((x) => x !== k),
                  });
                  await client.invalidateQueries({ queryKey: ["profile"] });
                } catch (e) {
                  Alert.alert(
                    "Could not save",
                    e instanceof Error ? e.message : "Try again",
                  );
                }
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
export function AssistantScreen() {
  const styles = useStyles();
  const api = useApi();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.card}>
        <Sparkles color="#6d3df5" size={32} />
        <Text style={styles.title}>A little clarity.</Text>
        <Text style={styles.muted}>
          Your assistant reads only permitted modules. Review proposed changes
          in the web workspace.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="What do I have tomorrow?"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Pressable
          style={styles.button}
          disabled={busy || !message.trim()}
          onPress={async () => {
            setBusy(true);
            try {
              const response = await api.assistant(message);
              setResult(
                response.text +
                  (response.proposal
                    ? `\n\nProposed: ${response.proposal.title}. Review in the web workspace before saving.`
                    : ""),
              );
            } catch (e) {
              setResult(e instanceof Error ? e.message : "Unavailable");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {busy ? "Thinking…" : "Ask crunchrr"}
          </Text>
        </Pressable>
        {result && <Text style={styles.body}>{result}</Text>}
      </View>
    </ScrollView>
  );
}
