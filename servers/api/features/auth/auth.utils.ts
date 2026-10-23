import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@workspace/types";

export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || "nutshyll-jwt-secret-key-2026";
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export const signToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token: string): AuthTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== "string" && "userId" in decoded) {
      return decoded as unknown as AuthTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
};
