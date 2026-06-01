import { DomainError } from './DomainError';

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  constructor(message = 'Conflict') {
    super(message);
  }
}
