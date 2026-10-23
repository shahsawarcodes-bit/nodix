import type { Block, BlockType, Collaborator, GeneralAccess, Page, PermissionRole, Template } from "@workspace/types";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;

  public constructor(message: string, status: number, code?: string | undefined) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";
};

const getStoredAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("nutshyll_auth_token");
  } catch {
    return null;
  }
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = `${getApiBaseUrl()}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getStoredAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `Request to ${path} failed with status ${String(response.status)}`;
    let errorCode: string | undefined;

    try {
      const errorBody = (await response.json()) as { error?: { message?: string; code?: string } };
      if (errorBody.error?.message) {
        errorMessage = errorBody.error.message;
      }
      if (errorBody.error?.code) {
        errorCode = errorBody.error.code;
      }
    } catch {
      // Body was not JSON
    }

    throw new ApiClientError(errorMessage, response.status, errorCode);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
};

export interface CreatePageInput {
  title?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  parentId?: string | null | undefined;
}

export interface UpdatePageInput {
  title?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  parentId?: string | null | undefined;
  generalAccess?: GeneralAccess | undefined;
  publicPermission?: PermissionRole | undefined;
  collaborators?: Collaborator[] | undefined;
}

export interface CreateBlockInput {
  id?: string | undefined;
  pageId: string;
  parentId?: string | null | undefined;
  type?: BlockType | undefined;
  text?: string | undefined;
  pos?: string | undefined;
  props?: Record<string, unknown> | undefined;
}

export interface UpdateBlockInput {
  parentId?: string | null | undefined;
  type?: BlockType | undefined;
  text?: string | undefined;
  props?: Record<string, unknown> | undefined;
  pos?: string | undefined;
}

export const listPages = async (): Promise<Page[]> => {
  return request<Page[]>("/api/pages");
};

export const createPage = async (input: CreatePageInput = {}): Promise<Page> => {
  return request<Page>("/api/pages", {
    method: "POST",
    body: JSON.stringify(input)
  });
};

export const getPage = async (id: string): Promise<Page> => {
  return request<Page>(`/api/pages/${encodeURIComponent(id)}`);
};

export const updatePage = async (id: string, patch: UpdatePageInput): Promise<Page> => {
  return request<Page>(`/api/pages/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
};

export const deletePage = async (id: string): Promise<void> => {
  await request<void>(`/api/pages/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
};

export const listBlocks = async (pageId: string): Promise<Block[]> => {
  return request<Block[]>(`/api/blocks?pageId=${encodeURIComponent(pageId)}`);
};

export const createBlock = async (input: CreateBlockInput): Promise<Block> => {
  return request<Block>("/api/blocks", {
    method: "POST",
    body: JSON.stringify(input)
  });
};

export const updateBlock = async (id: string, patch: UpdateBlockInput): Promise<Block> => {
  return request<Block>(`/api/blocks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
};

export const deleteBlock = async (id: string): Promise<void> => {
  await request<void>(`/api/blocks/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
};

export const getAssetUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  if (!path.startsWith("/uploads") && !path.startsWith("/api") && path.startsWith("/")) {
    return path;
  }
  const base = getApiBaseUrl();
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const uploadFile = async (file: File): Promise<{ url: string; fileName: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const url = `${getApiBaseUrl()}/api/upload`;
  const headers = new Headers();
  const token = getStoredAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData
  });
  if (!response.ok) {
    throw new ApiClientError("Failed to upload file", response.status);
  }
  return (await response.json()) as { url: string; fileName: string };
};

export const listTemplates = async (): Promise<Template[]> => {
  return request<Template[]>("/api/templates");
};

export const applyTemplate = async (templateId: string, parentId?: string | null): Promise<Page> => {
  return request<Page>(`/api/templates/${encodeURIComponent(templateId)}/apply`, {
    method: "POST",
    body: JSON.stringify({ parentId: parentId ?? null })
  });
};
