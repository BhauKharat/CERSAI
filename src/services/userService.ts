/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from './api';

export interface UserData {
  [key: string]: any;
}

export async function fetchUsers() {
  return apiRequest('/api/users');
}

export async function createUser(data: UserData) {
  return apiRequest('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: UserData) {
  return apiRequest(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
