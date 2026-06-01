import { Name } from '@domain/shared/value-objects/Name';

describe('Tests on Name value object', () => {
  it('should create with a valid string', () => {
    const name = Name.create('John');
    expect(name.value).toBe('John');
  });

  it('should return the value via getter', () => {
    const name = Name.create('Alice');
    expect(name.value).toBe('Alice');
  });

  it('should trim whitespace', () => {
    const name = Name.create('  Bob  ');
    expect(name.value).toBe('Bob');
  });

  it('should throw when name is empty', () => {
    expect(() => Name.create('')).toThrow('Name is required');
  });

  it('should throw when name is only whitespace', () => {
    expect(() => Name.create('   ')).toThrow('Name is required');
  });

  it('should throw when name is 1 character', () => {
    expect(() => Name.create('A')).toThrow('at least 2');
  });

  it('should throw when name exceeds 100 characters', () => {
    expect(() => Name.create('A'.repeat(101))).toThrow('100');
  });

  it('should accept name with exactly 2 characters', () => {
    const name = Name.create('Jo');
    expect(name.value).toBe('Jo');
  });

  it('should accept name with exactly 100 characters', () => {
    const name = Name.create('A'.repeat(100));
    expect(name.value).toBe('A'.repeat(100));
  });
});
