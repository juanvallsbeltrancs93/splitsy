import { Password } from '@domain/shared/value-objects/Password';

describe('Tests on Password value object', () => {
  it('should create with a valid strong password', () => {
    const password = Password.create('Secret1!');
    expect(password.value).toBe('Secret1!');
  });

  it('should return the value via getter', () => {
    const password = Password.create('Secret1!');
    expect(password.value).toBe('Secret1!');
  });

  it('should throw when password is empty', () => {
    expect(() => Password.create('')).toThrow('Password is required');
  });

  it('should throw when password has no uppercase', () => {
    expect(() => Password.create('secret1!')).toThrow('Password must be at least 8 characters');
  });

  it('should throw when password has no lowercase', () => {
    expect(() => Password.create('SECRET1!')).toThrow('Password must be at least 8 characters');
  });

  it('should throw when password has no digit', () => {
    expect(() => Password.create('Secretab!')).toThrow('Password must be at least 8 characters');
  });

  it('should throw when password has no special character', () => {
    expect(() => Password.create('Secret12')).toThrow('Password must be at least 8 characters');
  });

  it('should throw when password is less than 8 characters', () => {
    expect(() => Password.create('Se1!')).toThrow('Password must be at least 8 characters');
  });
});

