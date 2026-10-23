import type { AuthResponse, User } from "@workspace/types";
import { setStoredToken, setStoredUser, clearStoredAuth, getStoredToken } from "./auth-token";


const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4001";
};

export class AuthApiError extends Error {
  public constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "AuthApiError";
  }
}

export const registerUser = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const url = `${getApiBaseUrl()}/api/auth/register`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const data = (await response.json()) as { error?: { message?: string } } & AuthResponse;
  if (!response.ok) {
    throw new AuthApiError(data.error?.message || "Registration failed", response.status);
  }

  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
};

export const loginUser = async (input: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const url = `${getApiBaseUrl()}/api/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  const data = (await response.json()) as { error?: { message?: string } } & AuthResponse;
  if (!response.ok) {
    throw new AuthApiError(data.error?.message || "Login failed", response.status);
  }

  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const url = `${getApiBaseUrl()}/api/auth/me`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearStoredAuth();
      }
      return null;
    }

    const data = (await response.json()) as { user: User };
    setStoredUser(data.user);
    return data.user;
  } catch {
    return null;
  }
};
