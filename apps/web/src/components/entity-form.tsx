"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createEntitySchema,
  entityKinds,
  type Entity,
  type EntityKind,
  type CreateEntity,
} from "@crunchrr/validation";
import { domainFields, defaultData, parseQuickAdd } from "@crunchrr/utils";
import { Sparkles, Paperclip, SquareCheck, Flag } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { kindLabel } from "@/lib/modules";
import type { ApiClient } from "@crunchrr/api-client";
interface FormValues {
  title: string;
  description: string;
  dueAt: string;
  priority: Entity["priority"];
  recurrence: Entity["recurrence"];
  status: Entity["status"];
  data: Record<string, unknown>;
}
const local = (value: unknown) =>
  typeof value === "string" && value
    ? new Date(
        new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16)
    : "";
export function EntityForm({
  kind: initialKind,
  entity,
  proposal,
  open,
  onClose,
  onSave,
  api,
}: {
  kind: EntityKind;
  entity?: Entity;
  proposal?: CreateEntity;
  open: boolean;
  onClose: () => void;
  onSave: (value: CreateEntity, entity?: Entity) => Promise<void>;
  api: ApiClient;
}) {
  const [kind, setKind] = useState(initialKind);
  const [error, setError] = useState("");
  const [natural, setNatural] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileId, setFileId] = useState<string | undefined>(
    typeof entity?.data.fileId === "string" ? entity.data.fileId : undefined,
  );
  const source = entity || proposal;
  const form = useForm<FormValues>({
    defaultValues: {
      title: source?.title || "",
      description: source?.description || "",
      dueAt: local(source?.dueAt),
      priority: source?.priority || "medium",
      status: source?.status || "todo",
      recurrence: source?.recurrence || "none",
      data: { ...defaultData(initialKind), ...source?.data },
    },
  });
  const { register, handleSubmit, reset } = form;
  function changeKind(value: EntityKind) {
    setKind(value);
    reset({ ...form.getValues(), data: defaultData(value) });
  }
  function preview() {
    const parsed = parseQuickAdd(natural);
    setKind(parsed.kind);
    reset({
      title: parsed.title,
      description: "",
      dueAt: local(parsed.dueAt),
      priority: "medium",
      status: parsed.kind === "event" ? "scheduled" : "todo",
      recurrence: "none",
      data: { ...defaultData(parsed.kind), ...parsed.data },
    });
    setError("Review the date, time, category and details before saving.");
  }
  async function submit(values: FormValues) {
    setError("");
    setBusy(true);
    try {
      const data = { ...values.data };
      for (const field of domainFields[kind]) {
        if (field.type === "number") {
          if (data[field.key] === "" || data[field.key] === undefined)
            delete data[field.key];
          else data[field.key] = Number(data[field.key]);
        }
        if (field.type === "datetime-local") {
          if (data[field.key])
            data[field.key] = new Date(String(data[field.key])).toISOString();
          else delete data[field.key];
        }
      }
      if (fileId && kind === "document") data.fileId = fileId;
      const parsed = createEntitySchema.safeParse({
        ...values,
        kind,
        data,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null,
      });
      if (!parsed.success) {
        setError(
          parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        );
        return;
      }
      await onSave(parsed.data, entity);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const response = await api.upload(file.name, file.type, file.size);
      const sent = await fetch(response.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!sent.ok) throw new Error("File upload failed. Try again.");
      setFileId(response.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      wide={kind === "task"}
      className={kind === "task" ? "task-dialog" : ""}
      title={
        entity
          ? `Edit ${kindLabel(kind).toLowerCase()}`
          : `Add ${kindLabel(kind).toLowerCase()}`
      }
      description={
        kind === "task"
          ? "Make a clear plan, then get it done."
          :
        ["medicine", "health"].includes(kind)
          ? "For organization and tracking. Enter information as provided by your clinician."
          : "Create a record, then connect it to the rest of your life."
      }
    >
      {kind === "task" && (
        <div className="task-form-intro">
          <span className="task-form-mark"><SquareCheck size={24} /></span>
          <div><strong>What needs your attention?</strong><span>Give it a name, choose when it matters, and set a priority.</span></div>
        </div>
      )}
      {!entity && (
        <div className="natural-input">
          <Sparkles size={18} />
          <input
            aria-label="Natural-language quick add"
            placeholder={kind === "task" ? "Try ‘Finish report tomorrow at 9’" : "Try ‘Bought groceries for ₹840’"}
            value={natural}
            onChange={(e) => setNatural(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={preview}
            disabled={!natural.trim()}
          >
            Preview
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit(submit)} className="entity-form">
        {!entity && kind !== "task" && (
          <label>
            Type
            <select
              value={kind}
              onChange={(e) => changeKind(e.target.value as EntityKind)}
            >
              {entityKinds.map((k) => (
                <option key={k} value={k}>
                  {kindLabel(k)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Title
          <input
            autoFocus
            {...register("title", { required: true })}
            placeholder={`Name your ${kindLabel(kind).toLowerCase()}`}
            required
            maxLength={200}
          />
        </label>
        <div className="form-grid">
          <label>
            {kind === "task" ? "Due date & time" : "Date & time"}
            <input type="datetime-local" {...register("dueAt")} />
          </label>
          {kind === "task" ? (
            <fieldset className="task-priority">
              <legend><Flag size={14} /> Priority</legend>
              <div>{(["low", "medium", "high", "urgent"] as const).map((priority) => (
                <button key={priority} type="button" className={form.watch("priority") === priority ? "selected" : ""} aria-pressed={form.watch("priority") === priority} onClick={() => form.setValue("priority", priority)}>{priority}</button>
              ))}</div>
            </fieldset>
          ) : (
            <label>Priority<select {...register("priority")}>
              {["low", "medium", "high", "urgent"].map((v) => <option key={v}>{v}</option>)}
            </select></label>
          )}
        </div>
        <div className="form-grid">
          {(kind !== "task" || entity) && <label>
            Status
            <select {...register("status")}>
              {(kind === "task" ? ["todo", "in_progress", "completed"] : [
                "todo",
                "inbox",
                "in_progress",
                "completed",
                "cancelled",
                "scheduled",
                "taken",
                "skipped",
                "missed",
                "snoozed",
                "ordered",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "returned",
                "active",
                "paused",
              ]).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>}
          <label>
            Repeat
            <select {...register("recurrence")}>
              {["none", "daily", "weekly", "monthly", "yearly"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        {kind === "task" && !entity ? (
          <details className="task-extra"><summary>More task options</summary>
            <label>Estimated minutes<input type="number" min="0" {...register("data.estimatedMinutes")} /></label>
          </details>
        ) : domainFields[kind].map((field) => (
          <label key={`${kind}-${field.key}`}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea rows={4} {...register(`data.${field.key}`)} />
            ) : field.type === "select" ? (
              <select {...register(`data.${field.key}`)}>
                {field.options?.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                step={field.type === "number" ? "any" : undefined}
                {...register(`data.${field.key}`)}
                defaultValue={
                  field.type === "datetime-local"
                    ? local(form.getValues(`data.${field.key}`))
                    : undefined
                }
              />
            )}
          </label>
        ))}
        <label>
          Notes
          <textarea
            {...register("description")}
            rows={2}
            placeholder="A little more context…"
          />
        </label>
        {kind === "document" && (
          <label className="file-input">
            <Paperclip size={16} />
            {fileId
              ? "File attached · choose to replace"
              : "Attach a private file (up to 20 MB)"}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,text/plain"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : entity ? "Save changes" : kind === "task" ? "Create task" : `Create ${kindLabel(kind).toLowerCase()}`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
