/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

export default function useApi<T = any>(
  apiFunc: (...args: any[]) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const request = async (...args: any[]) => {
    setLoading(true);
    try {
      const result = await apiFunc(...args);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, request };
}
