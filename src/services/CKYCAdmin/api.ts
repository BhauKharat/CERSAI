/* eslint-disable @typescript-eslint/no-explicit-any */
import _axios from 'axios';
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../../utils/constants';
// import type { RootState } from '../app/store';

// Create typed axios instance
const axios = _axios as unknown as {
  <T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>
  ): Promise<R>;
  <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
  defaults: any;
  interceptors: any;
  create(config?: AxiosRequestConfig): any;
};

// Define a custom interface that extends InternalAxiosRequestConfig to include custom properties
// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//   _retry?: boolean;
// }

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference will be set when the app initializes
let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from Redux store if available (same as Secured instance)
    if (store) {
      const token = store.getState()?.auth?.authToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle common errors here (e.g., 401, 403, 500)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access (e.g., redirect to login)
          // history.push('/login');
          break;
        case 403:
          // Handle forbidden access
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
        default:
          // Handle other errors
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// HTTP methods
export const get = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.get(url, config) as Promise<AxiosResponse<T>>;
};

export const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.post(url, data, config) as Promise<AxiosResponse<T>>;
};

export const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.put(url, data, config) as Promise<AxiosResponse<T>>;
};

export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return api.delete(url, config) as Promise<AxiosResponse<T>>;
};

export default api;
