export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string | Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
}
