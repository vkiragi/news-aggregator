import { PrismaClient } from './generated/prisma';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Define a global type for PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma Client
export const db = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Assign the client to global object in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
} 