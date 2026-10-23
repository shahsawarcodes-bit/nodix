import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/index.js";
import { AuthError, type AuthService } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export interface AuthController {
  register(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  getMe(req: Request, res: Response): Promise<void>;
}

export const createAuthController = (service: AuthService): AuthController => ({
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await service.register(input);
      res.status(HTTP_STATUS.created).json(result);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({ error: { message: err.message } });
        return;
      }
      throw err;
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await service.login(input);
      res.status(HTTP_STATUS.ok).json(result);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({ error: { message: err.message } });
        return;
      }
      throw err;
    }
  },

  getMe: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(HTTP_STATUS.unauthorized).json({
        error: { message: "Not authenticated" }
      });
      return;
    }
    const user = await service.getUserById(req.user.id);
    if (!user) {
      res.status(HTTP_STATUS.notFound).json({
        error: { message: "User not found" }
      });
      return;
    }
    res.status(HTTP_STATUS.ok).json({ user });
  }
});
