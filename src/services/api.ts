/* eslint-disable @typescript-eslint/no-explicit-any */
// Generic API utility
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error('API error: ' + response.statusText);
  return response.json();
}
