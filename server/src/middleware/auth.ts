import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ============================================
// JWT PAYLOAD SHAPE
// ============================================

export type JwtPayload = {
  userId: number;
  email: string;
};

// Extend Express Request so routes can read req.user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ============================================
// SIGN A TOKEN
// ============================================

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "30d",
  });
}

// ============================================
// VERIFY MIDDLEWARE
// Attach req.user if token is valid.
// Return 401 if missing or invalid.
// ============================================

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
    return;
  }

  const token = authHeader.slice(7);

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
    });
  }
}

// ============================================
// OPTIONAL AUTH
// Populates req.user if a valid token is
// present, but does NOT block the request
// if no token is provided.
// ============================================

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid or expired — just ignore it for optional routes
  }

  next();
}
