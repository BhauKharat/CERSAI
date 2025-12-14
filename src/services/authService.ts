/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from './api';

export interface Credentials {
  [key: string]: any;
}

export async function login(credentials: Credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  return apiRequest('/api/auth/logout', { method: 'POST' });
}
