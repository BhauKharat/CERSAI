/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from './api';

export interface KYCData {
  [key: string]: any;
}

export async function fetchKYCList() {
  return apiRequest('/api/kyc');
}

export async function createKYC(data: KYCData) {
  return apiRequest('/api/kyc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateKYC(id: string, data: KYCData) {
  return apiRequest(`/api/kyc/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
