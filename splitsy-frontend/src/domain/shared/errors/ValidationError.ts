import { DomainError } from './DomainError';

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  constructor(message = 'Validation failed') {
    super(message);
  }
}
