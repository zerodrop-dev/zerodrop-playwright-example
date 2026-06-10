// Simple in-memory store for the demo app
// In production you'd use a real database

interface User {
  email: string;
  password: string;
  verified: boolean;
}

interface Token {
  email: string;
  type: 'verify' | 'reset';
  expires: number;
}

const users = new Map<string, User>();
const tokens = new Map<string, Token>();

export function createUser(email: string, password: string) {
  users.set(email, { email, password, verified: false });
}

export function getUser(email: string) {
  return users.get(email);
}

export function verifyUser(email: string) {
  const user = users.get(email);
  if (user) {
    user.verified = true;
    users.set(email, user);
  }
}

export function updatePassword(email: string, password: string) {
  const user = users.get(email);
  if (user) {
    user.password = password;
    users.set(email, user);
  }
}

export function createToken(email: string, type: 'verify' | 'reset') {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  tokens.set(token, {
    email,
    type,
    expires: Date.now() + 1000 * 60 * 30, // 30 minutes
  });
  return token;
}

export function getToken(token: string) {
  return tokens.get(token);
}

export function deleteToken(token: string) {
  tokens.delete(token);
}
