import { Id } from '@domain/shared/value-objects/Id';

describe('Tests on Id value object', () => {
  it('should create a random Id with a value', () => {
    const id = Id.create();
    expect(id.value).toBeDefined();
    expect(id.value.length).toBeGreaterThan(0);
  });

  it('should create an Id from a given value', () => {
    const id = Id.createFrom('abc-123');
    expect(id.value).toBe('abc-123');
  });

  it('should return the value via getter', () => {
    const id = Id.createFrom('test-id');
    expect(id.value).toBe('test-id');
  });

  it('should return true when comparing equal Ids', () => {
    const id1 = Id.createFrom('same');
    const id2 = Id.createFrom('same');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing different Ids', () => {
    const id1 = Id.createFrom('one');
    const id2 = Id.createFrom('two');
    expect(id1.equals(id2)).toBe(false);
  });
});
