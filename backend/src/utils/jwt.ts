import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (userId: string): string => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: "7d",
  });
};

export interface DecodedToken {
  id: string;
}

export const verifyToken = (token: string): DecodedToken => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.verify(token, env.jwtSecret) as DecodedToken;
};
