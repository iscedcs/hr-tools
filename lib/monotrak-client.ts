import { MONOTRACK_API_ORIGIN, URLS } from "@/lib/const";

export type MonotrakUser = {
  id: string;
  email?: string;
  name?: string;
};

export type MonotrakTask = {
  id: string;
  title: string;
  status?: string;
  assignedToId?: string;
  assigneeEmail?: string;
  assigneeName?: string;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
};

export type MonotrakIntegrationStatus = {
  enabled: boolean;
  reason?: string;
};

type MonotrakFetchResult<T> = {
  data: T | null;
  error: string | null;
  integrationStatus: MonotrakIntegrationStatus;
};

const MONOTRAK_API_KEY = process.env.MONOTRAK_API_KEY_ISCE;
const MONOTRAK_AUTH_HEADER =
  process.env.MONOTRAK_AUTH_HEADER?.trim().toLowerCase() || "x-api-key";

function getIntegrationStatus(): MonotrakIntegrationStatus {
  if (!MONOTRACK_API_ORIGIN) {
    return { enabled: false, reason: "MonoTrak URL not configured" };
  }

  if (!MONOTRAK_API_KEY) {
    return { enabled: false, reason: "MonoTrak API key not configured" };
  }

  return { enabled: true };
}

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (MONOTRAK_API_KEY) {
    if (MONOTRAK_AUTH_HEADER === "authorization") {
      headers.Authorization = `Bearer ${MONOTRAK_API_KEY}`;
    } else {
      headers["X-API-KEY"] = MONOTRAK_API_KEY;
    }
  }

  return headers;
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  const record = value as
    | { data?: unknown; items?: unknown; tasks?: unknown }
    | undefined;

  if (Array.isArray(record?.data)) {
    return record?.data;
  }

  if (Array.isArray((record?.data as { items?: unknown } | undefined)?.items)) {
    return (record?.data as { items?: unknown }).items as unknown[];
  }

  if (Array.isArray(record?.items)) {
    return record?.items as unknown[];
  }

  if (Array.isArray(record?.tasks)) {
    return record?.tasks as unknown[];
  }

  return [];
}

function normalizeUser(raw: Record<string, unknown>): MonotrakUser | null {
  const id = String(raw.id ?? raw.userId ?? raw._id ?? "");
  if (!id) {
    return null;
  }

  return {
    id,
    email: (raw.email as string | undefined) ?? undefined,
    name:
      (raw.fullName as string | undefined) ??
      (raw.name as string | undefined) ??
      (raw.username as string | undefined) ??
      undefined,
  };
}

function normalizeTask(raw: Record<string, unknown>): MonotrakTask | null {
  const id = String(raw.id ?? raw.taskId ?? raw._id ?? "");
  if (!id) {
    return null;
  }

  const assignedTo =
    raw.assignedTo as Record<string, unknown> | string | undefined;
  const assignee =
    (raw.assignee as Record<string, unknown> | undefined) ?? undefined;

  const assignedToId =
    typeof assignedTo === "string"
      ? assignedTo
      : (assignedTo?.id as string | undefined);

  const assigneeEmail =
    (assignee?.email as string | undefined) ??
    (assignedTo && typeof assignedTo === "object"
      ? (assignedTo.email as string | undefined)
      : undefined) ??
    undefined;

  const assigneeName =
    (assignee?.fullName as string | undefined) ??
    (assignee?.name as string | undefined) ??
    (assignedTo && typeof assignedTo === "object"
      ? ((assignedTo.fullName as string | undefined) ??
          (assignedTo.name as string | undefined))
      : undefined) ??
    undefined;

  return {
    id,
    title:
      (raw.title as string | undefined) ??
      (raw.name as string | undefined) ??
      "Untitled task",
    status: (raw.status as string | undefined) ?? undefined,
    assignedToId,
    assigneeEmail,
    assigneeName,
    createdAt:
      (raw.createdAt as string | undefined) ??
      (raw.created_at as string | undefined) ??
      undefined,
    updatedAt:
      (raw.updatedAt as string | undefined) ??
      (raw.updated_at as string | undefined) ??
      undefined,
    dueDate:
      (raw.dueDate as string | undefined) ??
      (raw.due_date as string | undefined) ??
      undefined,
  };
}

async function monotrakFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<MonotrakFetchResult<T>> {
  const integrationStatus = getIntegrationStatus();
  if (!integrationStatus.enabled) {
    return { data: null, error: integrationStatus.reason || null, integrationStatus };
  }

  const url = new URL(path, MONOTRACK_API_ORIGIN);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  try {
    const response = await fetch(url.toString(), {
      headers: buildHeaders(),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => "");
      const detail = responseBody ? `: ${responseBody.slice(0, 200)}` : "";
      return {
        data: null,
        error: `MonoTrak request failed (${response.status})${detail}`,
        integrationStatus,
      };
    }

    const json = (await response.json()) as T;
    return { data: json, error: null, integrationStatus };
  } catch (error) {
    console.error("MonoTrak fetch error:", error);
    return {
      data: null,
      error: "MonoTrak request failed",
      integrationStatus,
    };
  }
}

export async function fetchMonotrakUsers() {
  const result = await monotrakFetch<unknown>(URLS.users.all, {
    page: 1,
    perPage: 200,
  });

  if (!result.data) {
    return {
      users: [] as MonotrakUser[],
      error: result.error,
      integrationStatus: result.integrationStatus,
    };
  }

  const users = extractArray(result.data)
    .map((item) => normalizeUser(item as Record<string, unknown>))
    .filter((user): user is MonotrakUser => Boolean(user));

  return { users, error: result.error, integrationStatus: result.integrationStatus };
}

export async function fetchMonotrakTasks(params?: { assignedTo?: string }) {
  const result = await monotrakFetch<unknown>(URLS.tasks.all, {
    assignedTo: params?.assignedTo,
    page: 1,
    perPage: 200,
  });

  if (!result.data) {
    return {
      tasks: [] as MonotrakTask[],
      error: result.error,
      integrationStatus: result.integrationStatus,
    };
  }

  const tasks = extractArray(result.data)
    .map((item) => normalizeTask(item as Record<string, unknown>))
    .filter((task): task is MonotrakTask => Boolean(task));

  return { tasks, error: result.error, integrationStatus: result.integrationStatus };
}

const ACTIVE_STATUS_KEYWORDS = [
  "in_progress",
  "in progress",
  "pending",
  "open",
  "todo",
];

function isActiveStatus(status?: string) {
  if (!status) {
    return false;
  }

  const normalized = status.toLowerCase();
  return ACTIVE_STATUS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function filterTasksForDate(
  tasks: MonotrakTask[],
  start: Date,
  end: Date
) {
  return tasks.filter((task) => {
    const updatedAt = parseDate(task.updatedAt);
    const createdAt = parseDate(task.createdAt);
    const dueDate = parseDate(task.dueDate);

    const updatedToday =
      updatedAt && updatedAt >= start && updatedAt < end;
    const createdToday =
      createdAt && createdAt >= start && createdAt < end;
    const dueToday = dueDate && dueDate >= start && dueDate < end;

    return updatedToday || createdToday || dueToday || isActiveStatus(task.status);
  });
}
