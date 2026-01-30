import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ConflictError } from '../utils/AppError';
import { User } from '@prisma/client';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import logger from '../utils/logger';

// ============ TYPES ============

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

// ============ HELPERS ============

const SALT_ROUNDS = 10;

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

function generateToken(userId: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn } as jwt.SignOptions);
}

// ============ SERVICE FUNCTIONS ============

/**
 * Register a new user
 */
export async function register(data: RegisterInput): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  // New users start with a clean slate - they can use templates to create habits

  const token = generateToken(user.id);

  logger.info('User registered', { userId: user.id, email: user.email });

  return {
    user: toSafeUser(user),
    token,
  };
}

/**
 * Login user
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, user.password);

  if (!isValidPassword) {
    throw new AuthenticationError('Invalid email or password');
  }

  const token = generateToken(user.id);

  logger.info('User logged in', { userId: user.id });

  return {
    user: toSafeUser(user),
    token,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user ? toSafeUser(user) : null;
}
