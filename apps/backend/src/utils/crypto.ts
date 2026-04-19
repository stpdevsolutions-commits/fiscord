import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { JWTPayload } from '../types';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 días

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: TOKEN_EXPIRY_SECONDS,
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch {
    return null;
  }
}

export const TOKEN_EXPIRY = TOKEN_EXPIRY_SECONDS;
