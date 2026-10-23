import type { AuthResponse, User } from "@workspace/types";
import { UserModel } from "./auth.model.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";
import { hashPassword, signToken, verifyPassword } from "./auth.utils.js";

export class AuthError extends Error {
  public constructor(message: string, public readonly statusCode: number = 400) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AuthService {
  register(input: RegisterInput): Promise<AuthResponse>;
  login(input: LoginInput): Promise<AuthResponse>;
  getUserById(id: string): Promise<User | null>;
}

export const createAuthService = (): AuthService => ({
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const existing = await UserModel.findOne({ email: input.email }).lean();
    if (existing) {
      throw new AuthError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const userDoc = await UserModel.create({
      email: input.email,
      passwordHash,
      name: input.name
    });

    const user: User = {
      id: userDoc._id,
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    return { token, user };
  },

  login: async (input: LoginInput): Promise<AuthResponse> => {
    const userDoc = await UserModel.findOne({ email: input.email });
    if (!userDoc) {
      throw new AuthError("Invalid email or password", 401);
    }

    const isValid = await verifyPassword(input.password, userDoc.passwordHash);
    if (!isValid) {
      throw new AuthError("Invalid email or password", 401);
    }

    const user: User = {
      id: userDoc._id,
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    return { token, user };
  },

  getUserById: async (id: string): Promise<User | null> => {
    const userDoc = await UserModel.findById(id).lean();
    if (!userDoc) return null;
    return {
      id: userDoc._id,
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt
    };
  }
});
