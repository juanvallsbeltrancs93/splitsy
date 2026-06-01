import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { setupInterceptors } from '../../presentation/api/interceptors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/splitsy/v0';

export function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  setupInterceptors(instance);

  return instance;
}

/**
 * Public API client without auth interceptors.
 * Use this for unauthenticated endpoints (login, register) so that
 * 401 errors are not intercepted by the token refresh logic.
 */
export function createPublicApiClient(): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
