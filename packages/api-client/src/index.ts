import type {
  Entity,
  EntityKind,
  EntityLink,
  CreateEntity,
  Profile,
} from "@crunchrr/validation";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export interface Notification {
  id: string;
  title: string;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}
export interface AiResponse {
  text: string;
  proposal: CreateEntity | null;
  provider: string;
}
export function createApiClient(
  baseUrl: string,
  getToken: () => Promise<string | null>,
  demo = false,
) {
  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(demo ? { "X-Crunchrr-Demo": "true" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = (await response
        .json()
        .catch(() => ({ message: "Network request failed" }))) as {
        message?: string;
      };
      throw new ApiError(response.status, error.message || "Request failed");
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
  return {
    list: (kind?: EntityKind, q?: string, page = 1) =>
      request<{ items: Entity[]; total: number }>(
        `/entities?${new URLSearchParams({ ...(kind ? { kind } : {}), ...(q ? { q } : {}), page: String(page), limit: "100" })}`,
      ),
    get: (id: string) => request<Entity>(`/entities/${id}`),
    create: (value: CreateEntity) =>
      request<Entity>("/entities", {
        method: "POST",
        body: JSON.stringify(value),
      }),
    update: (entity: Entity, changes: Record<string, unknown>) =>
      request<Entity>(`/entities/${entity.id}`, {
        method: "PATCH",
        body: JSON.stringify({ version: entity.version, changes }),
      }),
    remove: (id: string) =>
      request<void>(`/entities/${id}`, { method: "DELETE" }),
    links: (id: string) => request<EntityLink[]>(`/entities/${id}/links`),
    link: (sourceId: string, targetId: string, relationship = "related") =>
      request<EntityLink>("/links", {
        method: "POST",
        body: JSON.stringify({ sourceId, targetId, relationship }),
      }),
    unlink: (id: string) => request<void>(`/links/${id}`, { method: "DELETE" }),
    profile: () => request<Profile>("/profile"),
    saveProfile: (profile: Profile) =>
      request<Profile>("/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      }),
    notifications: () => request<Notification[]>("/notifications"),
    readNotification: (id: string) =>
      request<void>(`/notifications/${id}/read`, { method: "PATCH" }),
    assistant: (message: string) =>
      request<AiResponse>("/assistant", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    exportData: () =>
      request<{ entities: Entity[]; links: unknown[]; profile: Profile }>(
        "/export",
      ),
    deleteAccount: () =>
      request<void>("/account", {
        method: "DELETE",
        body: JSON.stringify({ confirmation: "DELETE MY ACCOUNT" }),
      }),
    upload: (name: string, contentType: string, size: number) =>
      request<{ id: string; url: string }>("/files", {
        method: "POST",
        body: JSON.stringify({ name, contentType, size }),
      }),
    download: (id: string) => request<{ url: string }>(`/files/${id}`),
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
