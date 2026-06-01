import { DomainError } from './DomainError';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
  }
}
