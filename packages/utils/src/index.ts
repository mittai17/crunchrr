import type { Entity, EntityKind } from "@crunchrr/validation";
export const money = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
export const numeric = (data: Record<string, unknown>, key: string) =>
  typeof data[key] === "number" ? (data[key] as number) : 0;
export const stringValue = (data: Record<string, unknown>, key: string) =>
  typeof data[key] === "string" ? (data[key] as string) : "";
export const dayKey = (date = new Date(), timezone = "Asia/Kolkata") =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export function dashboardStats(
  entities: Entity[],
  timezone: string,
  now = new Date(),
) {
  const today = dayKey(now, timezone),
    tasks = entities.filter(
      (e) =>
        e.kind === "task" &&
        e.status !== "cancelled" &&
        (!e.dueAt || dayKey(new Date(e.dueAt), timezone) === today),
    ),
    events = entities.filter(
      (e) =>
        e.kind === "event" &&
        dayKey(new Date(stringValue(e.data, "start")), timezone) === today,
    ),
    expenses = entities.filter(
      (e) =>
        e.kind === "expense" &&
        dayKey(new Date(e.dueAt || e.createdAt), timezone) === today,
    ),
    medicines = entities.filter(
      (e) => e.kind === "medicine" && e.status !== "cancelled",
    );
  return {
    tasks: tasks.length,
    completed: tasks.filter((e) => e.status === "completed").length,
    events: events.length,
    expenses: expenses.reduce((sum, e) => sum + numeric(e.data, "amount"), 0),
    steps: entities
      .filter(
        (e) =>
          e.kind === "health" &&
          e.data.metric === "steps" &&
          dayKey(new Date(stringValue(e.data, "recordedAt")), timezone) ===
            today,
      )
      .reduce((sum, e) => sum + numeric(e.data, "value"), 0),
    medicines: medicines.length,
    taken: medicines.filter(
      (e) =>
        Array.isArray(e.data.takenDates) && e.data.takenDates.includes(today),
    ).length,
    goals: entities.filter((e) => e.kind === "goal").length,
  };
}
export function parseQuickAdd(
  input: string,
  now = new Date(),
): {
  kind: EntityKind;
  title: string;
  data: Record<string, unknown>;
  dueAt: string | null;
  needsReview: true;
} {
  let kind: EntityKind = "task";
  const data: Record<string, unknown> = {};
  const amount = input.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i);
  let dueAt: string | null = null;
  if (amount) {
    kind = "expense";
    data.amount = Number(amount[1]?.replaceAll(",", ""));
    data.currency = "INR";
    data.category = /grocer|food|lunch|dinner/i.test(input) ? "Food" : "Other";
  } else if (/appointment|meeting|event/i.test(input)) kind = "event";
  else if (/^note\b/i.test(input)) {
    kind = "note";
    data.content = input.replace(/^note:?\s*/i, "");
  }
  if (/\btomorrow\b/i.test(input)) {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    const time = input.match(/(?:at\s+)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (time) {
      let h = Number(time[1]);
      if (time[3]?.toLowerCase() === "pm" && h < 12) h += 12;
      if (time[3]?.toLowerCase() === "am" && h === 12) h = 0;
      if (h <= 23 && Number(time[2] || 0) <= 59)
        next.setHours(h, Number(time[2] || 0), 0, 0);
    }
    dueAt = next.toISOString();
  }
  if (kind === "event") {
    data.start = dueAt || now.toISOString();
    data.end = new Date(
      new Date(String(data.start)).getTime() + 3600000,
    ).toISOString();
    data.location = "";
    data.participants = [];
  }
  return {
    kind,
    title: input.trim().slice(0, 200),
    data,
    dueAt,
    needsReview: true,
  };
}
export function nextOccurrence(date: Date, recurrence: string): Date | null {
  const d = new Date(date);
  if (recurrence === "daily") d.setUTCDate(d.getUTCDate() + 1);
  else if (recurrence === "weekly") d.setUTCDate(d.getUTCDate() + 7);
  else if (recurrence === "monthly") {
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const last = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
    ).getUTCDate();
    d.setUTCDate(Math.min(day, last));
  } else if (recurrence === "yearly") {
    const month = d.getUTCMonth();
    d.setUTCFullYear(d.getUTCFullYear() + 1);
    if (d.getUTCMonth() !== month) d.setUTCDate(0);
  } else return null;
  return d;
}
export interface Field {
  key: string;
  label: string;
  type: "text" | "url" | "number" | "datetime-local" | "textarea" | "select";
  options?: string[];
}
export const domainFields: Record<EntityKind, Field[]> = {
  task: [
    { key: "estimatedMinutes", label: "Estimated minutes", type: "number" },{key:"trackedMinutes",label:"Tracked work minutes",type:"number"},{key:"trackedAt",label:"Work tracked at",type:"datetime-local"},
  ],
  event: [
    { key: "start", label: "Starts", type: "datetime-local" },
    { key: "end", label: "Ends", type: "datetime-local" },
    { key: "location", label: "Location", type: "text" },
    { key: "meetingUrl", label: "Meeting link (HTTPS)", type: "url" },
  ],
  reminder: [
    { key: "channel", label: "Channel", type: "select", options: ["in_app"] },
  ],
  note: [{ key: "content", label: "Content (Markdown)", type: "textarea" }],
  expense: [
    { key: "amount", label: "Amount", type: "number" },
    { key: "currency", label: "Currency", type: "text" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        "Food",
        "Transport",
        "Shopping",
        "Health",
        "Education",
        "Entertainment",
        "Bills",
        "Travel",
        "Other",
      ],
    },
  ],
  income: [
    { key: "amount", label: "Amount", type: "number" },
    { key: "currency", label: "Currency", type: "text" },
    { key: "category", label: "Source", type: "text" },
  ],
  account: [
    { key: "balance", label: "Balance", type: "number" },
    { key: "currency", label: "Currency", type: "text" },
  ],
  budget: [
    { key: "amount", label: "Budget", type: "number" },
    { key: "category", label: "Category", type: "text" },
  ],
  health: [
    {
      key: "metric",
      label: "Metric",
      type: "select",
      options: [
        "steps",
        "weight",
        "height",
        "heart_rate",
        "blood_pressure",
        "glucose",
        "sleep",
        "water",
        "calories",
        "exercise",
        "symptom",
      ],
    },
    { key: "value", label: "Value", type: "number" },
    { key: "unit", label: "Unit", type: "text" },
    { key: "recordedAt", label: "Recorded at", type: "datetime-local" },
  ],
  medicine: [
    { key: "dosage", label: "Dosage (as prescribed)", type: "text" },
    { key: "quantity", label: "Current inventory", type: "number" },
    {
      key: "dailyConsumption",
      label: "Daily quantity (as prescribed)",
      type: "number",
    },
    { key: "instructions", label: "Instructions", type: "textarea" },
  ],
  goal: [
    { key: "target", label: "Target", type: "number" },
    { key: "current", label: "Current value", type: "number" },
    { key: "unit", label: "Unit", type: "text" },
    { key: "category", label: "Category", type: "text" },
  ],
  habit: [
    {
      key: "frequency",
      label: "Frequency",
      type: "select",
      options: ["daily", "weekly", "custom"],
    },
  ],
  wellbeing: [
    { key: "mood", label: "Mood (1–5)", type: "number" },
    { key: "energy", label: "Energy (1–10)", type: "number" },
    { key: "stress", label: "Stress (1–10)", type: "number" },
  ],
  project: [
    { key: "budget", label: "Budget", type: "number" },
    { key: "progress", label: "Progress (%)", type: "number" },
  ],
  person: [
    { key: "relationship", label: "Relationship", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
  ],
  meal: [
    {
      key: "category",
      label: "Meal",
      type: "select",
      options: ["Breakfast", "Lunch", "Snack", "Dinner"],
    },
    { key: "ingredients", label: "Ingredients", type: "textarea" },
  ],
  trip: [
    { key: "destination", label: "Destination", type: "text" },
    { key: "start", label: "Departure", type: "datetime-local" },
    { key: "end", label: "Return", type: "datetime-local" },
    { key: "bookings", label: "Bookings", type: "textarea" },
  ],
  vehicle: [
    { key: "make", label: "Make", type: "text" },
    { key: "model", label: "Model", type: "text" },
    { key: "registration", label: "Registration", type: "text" },
    {
      key: "insuranceExpiry",
      label: "Insurance expiry",
      type: "datetime-local",
    },
    { key: "serviceDue", label: "Service due", type: "datetime-local" },
  ],
  shopping: [
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "category", label: "Category", type: "text" },
  ],
  order: [
    { key: "store", label: "Store", type: "text" },
    { key: "orderId", label: "Order ID", type: "text" },
    { key: "amount", label: "Amount", type: "number" },
    { key: "trackingUrl", label: "HTTPS tracking URL", type: "text" },
  ],
  bill: [
    { key: "amount", label: "Amount", type: "number" },
    { key: "currency", label: "Currency", type: "text" },
    { key: "category", label: "Category", type: "text" },
  ],
  subscription: [
    { key: "amount", label: "Amount", type: "number" },
    { key: "currency", label: "Currency", type: "text" },
    { key: "category", label: "Category", type: "text" },
  ],
  document: [
    {
      key: "category",
      label: "Category",
      type: "select",
      options: [
        "Identity",
        "Education",
        "Health",
        "Insurance",
        "Vehicle",
        "Tax",
        "Finance",
        "Contracts",
        "Warranty",
        "Receipts",
        "Certificates",
        "Other",
      ],
    },
  ],
};
export function defaultData(
  kind: EntityKind,
  now = new Date(),
): Record<string, unknown> {
  const start = now.toISOString(),
    end = new Date(now.getTime() + 3600000).toISOString();
  const values: Record<EntityKind, Record<string, unknown>> = {
    task: {},
    event: { start, end, location: "", meetingUrl: "", participants: [] },
    reminder: { channel: "in_app" },
    note: { content: "", format: "markdown" },
    expense: { amount: 0, currency: "INR", category: "Other" },
    income: { amount: 0, currency: "INR", category: "Salary" },
    account: { balance: 0, currency: "INR" },
    budget: { amount: 0, currency: "INR", category: "Other" },
    health: { metric: "steps", value: 0, unit: "", recordedAt: start },
    medicine: {
      dosage: "",
      quantity: 0,
      dailyConsumption: 1,
      takenDates: [],
      unit: "tablets",
    },
    goal: { target: 1, current: 0, unit: "", category: "Personal" },
    habit: { frequency: "daily", completedDates: [] },
    wellbeing: { mood: 3, energy: 5, stress: 5 },
    project: { budget: 0, progress: 0, start: null },
    person: { relationship: "", email: "", phone: "" },
    meal: { category: "Breakfast", ingredients: "" },
    trip: { destination: "", start, end, bookings: "" },
    vehicle: {
      make: "",
      model: "",
      registration: "",
      insuranceExpiry: null,
      serviceDue: null,
    },
    shopping: { quantity: 1, category: "Other" },
    order: {
      store: "",
      orderId: "",
      amount: 0,
      currency: "INR",
      trackingUrl: "",
    },
    bill: { amount: 0, currency: "INR", category: "Utilities" },
    subscription: { amount: 0, currency: "INR", category: "Software" },
    document: { category: "Other", issueDate: null },
  };
  return values[kind];
}
