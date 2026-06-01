import { AxiosError } from 'axios';
import { NotFoundError, UnauthorizedError, ConflictError, ValidationError } from '../../domain/shared/errors';

export function translateApiError(error: unknown, resource: string, id?: string): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    switch (status) {
      case 404:
        throw new NotFoundError(resource, id || 'unknown');
      case 401:
        throw new UnauthorizedError(error.response?.data?.detail ?? error.response?.data?.message);
      case 409:
        throw new ConflictError(error.response?.data?.detail ?? error.response?.data?.message);
      case 422:
        throw new ValidationError(error.response?.data?.detail ?? error.response?.data?.message);
      default:
        throw error;
    }
  }
  throw error;
}
