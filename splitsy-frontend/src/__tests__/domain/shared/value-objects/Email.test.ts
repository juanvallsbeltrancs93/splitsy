import { Email } from '@domain/shared/value-objects/Email';

describe('Tests on Email value object', () => {
  it('should create with a valid email string', () => {
    const email = Email.create('user@example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('should return the value via getter', () => {
    const email = Email.create('test@test.com');
    expect(email.value).toBe('test@test.com');
  });

  it('should throw when email is empty', () => {
    expect(() => Email.create('')).toThrow('Email is a required field');
  });

  it('should throw when email format is invalid', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email address');
  });

  it('should throw when email has no domain', () => {
    expect(() => Email.create('user@')).toThrow('Invalid email address');
  });
});
