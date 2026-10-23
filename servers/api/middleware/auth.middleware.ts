import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../features/auth/auth.utils.js";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: { message: "Authentication required" } });
    return;
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: { message: "Invalid or expired token" } });
    return;
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    name: payload.name
  };
  next();
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.userId,
        email: payload.email,
        name: payload.name
      };
    }
  }
  next();
};
